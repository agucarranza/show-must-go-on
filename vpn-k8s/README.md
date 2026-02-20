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

## 1) Entrar al pod

```bash
kubectl exec -it deploy/openvpn -- bash
```

---

## 2) Generar configuración del servidor

(Reemplazar NODE_PUBLIC_IP por la IP pública real del nodo)

```bash
ovpn_genconfig -u udp://NODE_PUBLIC_IP:30443
ovpn_initpki
```

(Aceptar y definir passphrase para la CA)

---

## 3) Habilitar comunicación cliente-cliente

```bash
echo "client-to-client" >> /etc/openvpn/openvpn.conf
```

Verificar:

```bash
grep client-to-client /etc/openvpn/openvpn.conf
```

---

## 4) Crear usuarios

```bash
easyrsa build-client-full cami nopass
easyrsa build-client-full agus nopass
```

---

## 5) Configurar IPs estáticas (CCD)

```bash
mkdir -p /etc/openvpn/ccd
```

```bash
echo "client-config-dir /etc/openvpn/ccd" >> /etc/openvpn/openvpn.conf
```

### cami

```bash
cat <<EOF > /etc/openvpn/ccd/cami
ifconfig-push 10.8.0.10 255.255.255.0
EOF
```

### agus

```bash
cat <<EOF > /etc/openvpn/ccd/agus
ifconfig-push 10.8.0.20 255.255.255.0
EOF
```

---

## 6) Verificar subnet del servidor

Debe existir esta línea en /etc/openvpn/openvpn.conf:

```bash
server 10.8.0.0 255.255.255.0
```

Si no está, agregarla.

---

## 7) Reiniciar deployment

Salir del pod y ejecutar:

```bash
kubectl rollout restart deployment openvpn
```

---

## 8) Exportar archivos de cliente

Entrar nuevamente al pod:

```bash
kubectl exec -it deploy/openvpn -- bash
```

Generar archivos:

```bash
ovpn_getclient cami > /tmp/cami.ovpn
ovpn_getclient agus > /tmp/agus.ovpn
```

Salir del pod y copiar:

```bash
kubectl get pods
kubectl cp default/<POD_NAME>:/tmp/cami.ovpn .
kubectl cp default/<POD_NAME>:/tmp/agus.ovpn .
```

---

## 9) Verificar conexiones activas

Dentro del pod:

```bash
cat /etc/openvpn/openvpn-status.log
```

---

## Resultado esperado

cami → 10.8.0.10
agus → 10.8.0.20

Podrán comunicarse entre sí dentro del túnel:

10.8.0.10:7654
10.8.0.20:7654

El puerto 7654 NO se expone públicamente.
Solo el NodePort 30443/UDP está expuesto.
