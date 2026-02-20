# Kubernetes Installation Guide for Oracle Free Tier ARM (Ampere A1)

> **Optimized for**: 4 OCPU / 24GB RAM (or smaller configurations)
> **Container Runtime**: containerd
> **CNI Plugin**: Calico
> **Recommended OS**: Ubuntu 22.04 / 24.04 ARM64

---

## 📋 Table of Contents

- [Initial System Setup](#initial-system-setup)
- [Kubernetes Prerequisites](#kubernetes-prerequisites)
- [Container Runtime Installation](#container-runtime-installation)
- [Kubernetes Components Installation](#kubernetes-components-installation)
- [Cluster Initialization](#cluster-initialization)
- [Post-Installation Configuration](#post-installation-configuration)
- [Remote Access Configuration](#remote-access-configuration)

---

## Initial System Setup

### 1. Update System Packages

Update all system packages to their latest versions:

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Disable Swap (Required by kubelet)

Kubernetes requires swap to be disabled for proper operation:

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

**Verify swap is disabled:**

```bash
free -h
```

## Kubernetes Prerequisites

### 3. Configure Kernel Modules

Load required kernel modules for Kubernetes networking:

```bash
sudo modprobe overlay
sudo modprobe br_netfilter
```

**Make modules persistent across reboots:**

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
```

**Configure sysctl parameters for networking:**

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
EOF
```

**Apply sysctl settings:**

```bash
sudo sysctl --system
```

## Container Runtime Installation

### 4. Install containerd (Lightweight Alternative to Docker)

Install the containerd runtime:

```bash
sudo apt install -y containerd
```

**Generate default configuration:**

```bash
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
```

**Enable systemd cgroup driver:**

Change `SystemdCgroup = false` to `SystemdCgroup = true` in the config file.

**Automated approach:**

```bash
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

**Restart and enable containerd:**

```bash
sudo systemctl restart containerd
sudo systemctl enable containerd
```

## Kubernetes Components Installation

### 5. Add Official Kubernetes Repository (ARM Compatible)

Install required dependencies:

```bash
sudo apt install -y apt-transport-https ca-certificates curl gpg
```

**Create keyring directory:**

```bash
sudo mkdir -p /etc/apt/keyrings
```

**Add Kubernetes GPG key:**

```bash
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | \
sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```

**Add Kubernetes repository:**

```bash
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" | \
sudo tee /etc/apt/sources.list.d/kubernetes.list
```

**Update package index:**

```bash
sudo apt update
```

### 6. Install Kubernetes Components

Install kubelet, kubeadm, and kubectl:

```bash
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

> **Note**: The `apt-mark hold` command prevents these packages from being automatically updated.

### 7. Optimize for Oracle Free Tier

Increase file descriptor limits to prevent resource exhaustion:

```bash
echo "fs.inotify.max_user_instances=8192" | sudo tee -a /etc/sysctl.conf
echo "fs.inotify.max_user_watches=1048576" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Cluster Initialization

### 8. Initialize the Control Plane

> [!IMPORTANT]
> For Calico CNI, you must use the CIDR `192.168.0.0/16`

Initialize the Kubernetes cluster:

```bash
sudo kubeadm init \
  --pod-network-cidr=192.168.0.0/16 \
  --upload-certs
```

### 9. Configure kubectl for Current User

Set up kubectl access for the current user:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

**Test the configuration:**

```bash
kubectl get nodes
```

### 10. Install Calico CNI (ARM Compatible)

Deploy the Calico network plugin:

```bash
kubectl apply -f <https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/calico.yaml>
```

### 11. Install Local Path Provisioner

```bash
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
```

**Wait 1-2 minutes and check pod status:**

```bash
kubectl get pods -A
```

> **Note**: Wait until the node shows `Ready` status before proceeding.

---

## Post-Installation Configuration

### 12. Configure Single-Node Cluster (Common for Free Tier)

Allow the control plane to schedule regular workload pods:

```bash
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

### 13. Verify Installation

Check cluster status:

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

### 14. Optional: Additional Free Tier Optimizations

Disable unnecessary services to conserve resources:

```bash
sudo systemctl disable snapd --now
sudo systemctl disable fwupd --now
sudo systemctl disable ModemManager --now
sudo systemctl disable rpcbind --now
```

### 15. Installation Complete ✅

You now have a fully functional Kubernetes cluster on Oracle ARM Free Tier with:

- **Container Runtime**: containerd
- **Cluster Management**: kubeadm
- **Network Plugin**: Calico CNI
- **Configuration**: Optimized for low resource consumption

### 16. Adding Worker Nodes (Optional)

Initialize the worker with the same steps as the control plane, but skip the `kubeadm init` command.

**On the control plane node**, generate a join command:

```bash
kubeadm token create --print-join-command
```

Execute the generated command on each worker node to join them to the cluster.

## Remote Access Configuration

### 17. Configure kubectl on Local Machine for Remote Cluster Access

This section explains how to securely access your remote Kubernetes cluster from your local machine.

#### Prerequisites

- Kubernetes cluster running on a remote VM
- SSH access to the VM
- `kubectl` installed on your local machine

---

## Recommended Approach: SSH Tunnel (Secure)

This method does **NOT** expose port 6443 to the internet, providing better security.

---

### Step 1: Configure SSH Tunnel

Add the following configuration to `~/.ssh/config`:

```text
Host oracle-k8s
    IdentityFile ~/Desktop/oracle-keys/ssh-key-2025-02-26.key
    User ubuntu
    Hostname 158.101.117.42
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LocalForward 127.0.0.100:16443 127.0.0.1:6443
```

### Step 2: Configure Local DNS Resolution

The cluster certificate uses `kubernetes` as the DNS name. To avoid conflicts with localhost, we use a different IP address.

**Add the following entry to `/etc/hosts`:**

```text
127.0.0.100 kubernetes
```

**Automated approach:**

```bash
sudo tee -a /etc/hosts << EOF
127.0.0.100 kubernetes
EOF
```

### Step 3: Establish SSH Tunnel

**Interactive mode:**

```bash
ssh oracle-k8s
```

**Background mode (recommended):**

```bash
ssh -fN oracle-k8s
```

**Flags explained:**

- `-f` → Run in background
- `-N` → Don't execute remote shell

> [!WARNING]
>
> **Keep the SSH tunnel active while using kubectl. If running in background, the tunnel persists until manually terminated.**

---

### Step 4: Create Local Kube Directory

```bash
mkdir -p ~/.kube
```

### Step 5: Copy kubeconfig from Remote VM

```bash
ssh oracle-k8s "sudo cat /etc/kubernetes/admin.conf" > ~/.kube/oracle-cluster.yaml
```

---

### Step 6: Update kubeconfig Server Address

Replace the public IP address with the tunneled hostname:

```bash
sed -i 's/server: https:\/\/[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:6443/server: https:\/\/kubernetes:16443/' ~/.kube/oracle-cluster.yaml
```

### Step 7: Merge Kubernetes Contexts

**Backup existing config:**

```bash
cp ~/.kube/config ~/.kube/config.backup
```

**Merge configurations:**

```bash
KUBECONFIG=~/.kube/config:~/.kube/oracle-cluster.yaml \
kubectl config view --flatten > ~/.kube/config.new

mv ~/.kube/config.new ~/.kube/config
```

**Rename context for clarity:**

```bash
sed -i \
-e 's/name: kubernetes$/name: oracle-k8s/' \
-e 's/name: kubernetes-admin$/name: oracle-admin/' \
-e 's/cluster: kubernetes$/cluster: oracle-k8s/' \
-e 's/user: kubernetes-admin$/user: oracle-admin/' \
-e 's/name: kubernetes-admin@kubernetes/name: oracle-k8s/' \
~/.kube/config
```

**View merged configuration:**

```bash
cat ~/.kube/config
```

### Step 8: Switch to Remote Cluster Context

**List available contexts:**

```bash
kubectl config get-contexts
```

**Switch to the Oracle cluster:**

```bash
kubectl config use-context oracle-k8s
```

**Verify connectivity:**

```bash
kubectl get nodes
kubectl get pods -A
```

If successful, the node should appear in `Ready` state.

---

### Final Verification

```bash
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
```

If you see the node in `Ready` state, you're successfully managing the remote cluster! 🚀
