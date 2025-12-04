#!/bin/bash
set -e

# ---------------------------------------------
# CONFIGURATION
# ---------------------------------------------
DOCKER_USER="jithendarramagiri1998"
K8S_NAMESPACE="amazon"

# Microservices list (folder names = service names)
SERVICES=(
  "user-service"
  "product-service"
  "search-service"
  "inventory-service"
  "cart-service"
  "order-service"
  "payment-service"
  "notification-service"
  "review-service"
  "api-gateway"
)

echo "-------------------------------------------------"
echo " STEP 1: Docker Login (You will be prompted)"
echo "-------------------------------------------------"
docker login

echo "-------------------------------------------------"
echo " STEP 2: Building and Pushing Microservice Images"
echo "-------------------------------------------------"

for service in "${SERVICES[@]}"; do
  IMAGE="$DOCKER_USER/mini-amazon:$service"

  echo ""
  echo "➡ Building image for $service"
  docker build -t $IMAGE "./services/$service"

  echo "➡ Pushing image: $IMAGE"
  docker push $IMAGE
done

echo ""
echo "-------------------------------------------------"
echo " STEP 3: Building and Pushing Frontend Image"
echo "-------------------------------------------------"

FRONTEND_IMAGE="$DOCKER_USER/mini-amazon:frontend"

docker build -t $FRONTEND_IMAGE ./frontend
docker push $FRONTEND_IMAGE

echo ""
echo "-------------------------------------------------"
echo " STEP 4: Applying Kubernetes Manifests"
echo "-------------------------------------------------"

kubectl apply -f k8s/

echo ""
echo "-------------------------------------------------"
echo " STEP 5: Checking Deployment Status"
echo "-------------------------------------------------"

kubectl get pods -n $K8S_NAMESPACE
kubectl get svc -n $K8S_NAMESPACE

echo ""
echo "-------------------------------------------------"
echo "🚀 Deployment Complete!"
echo "-------------------------------------------------"
echo "Open the frontend LoadBalancer URL:"
echo "Run: kubectl get svc -n $K8S_NAMESPACE"
