## 01. Kubernetes Core & Architecture

Kubernetes, often abbreviated as **K8s**, is an open-source container orchestration platform originally designed by Google and now maintained by the Cloud Native Computing Foundation (CNCF).

While Docker packages your application into standalone containers that run beautifully on a single host, Kubernetes manages these containers across a cluster of multiple servers. It solves the hard parts of scaling: load balancing, high availability, rolling deployments, and self-healing.

Without an orchestrator, scaling to 50 server instances and load balancing traffic between them would require manual scripts and custom reverse proxy configurations. Kubernetes automates this continuous reconciliation loop to find and maintain your declared ideal state.

    Developer declares state (e.g., 5 Replicas)
            ↓
    Kubernetes API Server writes to etcd database
            ↓
    Scheduler allocates Pods to healthy Worker Nodes
            ↓
    Kubelet starts Docker containers locally

| Feature | Docker Standalone | Kubernetes |
| :--- | :--- | :--- |
| **Scale Level** | Single Host | Multi-node Cluster |
| **Self-healing** | ❌ None | ✅ Auto Pod Restarts |
| **Auto-scaling** | ❌ Manual | ✅ Horizontal Pod Autoscaler |
| **Load Balancing** | Basic (Compose) | ✅ Highly Integrated Services |

### Pods and Controllers

A **Pod** is the smallest deployable unit in Kubernetes. It wraps one or more app containers (like a Docker container), storage resources, and a unique network IP address together.

You rarely create Pods directly. Instead, you create a **Deployment** controller that declares how many replicas of that Pod should run continuously, ensuring zero-downtime rolling updates.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3          # Kubernetes maintains 3 pods alive at all times
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
    spec:
      containers:
      - name: api
        image: nginx:latest
        ports:
        - containerPort: 80
```

### Essential K8s Operations

To interact with the Kubernetes API cluster plane, you use the `kubectl` CLI tool. It sends declarative manifests directly up to the masters.

```bash
kubectl apply -f deployment.yaml        # deploy or update your manifest state
kubectl get pods                        # list currently running containers
kubectl logs deployment/api-deployment  # trace live analytics streams output
```
