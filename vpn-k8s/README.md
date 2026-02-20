# OpenVPN en Kubernetes – Configuración manual completa (IPs estáticas)

## Diagrama

```text
Cliente
   |
   |  UDP 30443
   v
NODE_IP:30443  (NodePort)
   |
   v
Pod OpenVPN (1194/UDP)
   |
   v
Red VPN 10.8.0.0/24
        |
        └── Usuarios pueden usar puerto 7654 entre ellos

Usuarios:

- cami → 10.8.0.10
- agus → 10.8.0.20

NodePort del servicio OpenVPN: 30443 (UDP)

---

# OpenVPN en Kubernetes (ARM64) con Client-to-Client habilitado

Estas instrucciones permiten:

- Habilitar comunicación entre clientes VPN
- Permitir salida a internet (NAT)
- Usar NodePort público
- Persistir configuración en PVC

---

## 🔹 1. Crear pod temporal para inicializar la configuración

```bash
kubectl run openvpn-init \
  --image=docker.io/thiagoyuiti/openvpn-arm64:latest \
  --overrides='
{
  "spec": {
    "nodeSelector": {"kubernetes.io/arch":"arm64"},
    "containers": [{
      "name":"openvpn",
      "image":"docker.io/thiagoyuiti/openvpn-arm64:latest",
      "command":["sleep","3600"],
      "securityContext":{"privileged":true},
      "volumeMounts":[{"name":"openvpn-data","mountPath":"/etc/openvpn"}]
    }],
    "volumes":[{"name":"openvpn-data","persistentVolumeClaim":{"claimName":"openvpn-pvc"}}]
  }
}' --restart=Never
```

Entrar al pod:

```bash
kubectl exec -it openvpn-init -- bash
```

---

## 🔹 2. (Opcional) Limpiar configuración previa

⚠️ Solo si no hay clientes creados aún:

```bash
rm -rf /etc/openvpn/*
```

---

## 🔹 3. Generar configuración con Client-to-Client + NAT

Reemplazar la IP por la IP pública del nodo.

Si usás NodePort 30443:

```bash
ovpn_genconfig -u udp://158.101.117.42:30443 -d -c -s 10.8.0.0/24
```

Parámetros usados:

- `-N` → Habilita NAT para salida a internet (no queremos que redirija el tráfico)
- `-d` → Disable default route (no redirect-gateway)
- `-c` → Permite comunicación entre clientes VPN
- `-s` → Define subred VPN

---

## 🔹 4. Inicializar PKI

```bash
ovpn_initpki
```

Escribir:

```
yes
```

---

## 🔹 5. Crear clientes

```bash
easyrsa build-client-full client1 nopass
easyrsa build-client-full client2 nopass
```

Exportar configuraciones:

```bash
ovpn_getclient client1 > client1.ovpn
ovpn_getclient client2 > client2.ovpn
```

Salir:

```bash
exit
```

Eliminar pod temporal:

```bash
kubectl delete pod openvpn-init
```

---

## 🔹 6. Reiniciar Deployment

```bash
kubectl rollout restart deployment openvpn
```

---

## 🔹 7. Verificar que client-to-client quedó activo

```bash
kubectl exec -it openvpn -- grep client-to-client /etc/openvpn/openvpn.conf
```

Debe mostrar:

```
client-to-client
```

---

## 🔹 8. Prueba entre clientes

Una vez conectados:

```bash
ping 10.8.0.X
```

Donde `X` es la IP VPN del otro cliente.

---

## ✅ Resultado esperado

- Clientes se conectan por IP pública: `158.101.117.42:30443`
- Obtienen IP dentro de `10.8.0.0/24`
- Pueden comunicarse entre sí
- Tienen salida a internet (si se usó `-N`)
- Configuración persiste en PVC
