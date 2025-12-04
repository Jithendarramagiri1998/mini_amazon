output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint of the EKS API server"
  value       = module.eks.cluster_endpoint
}

output "vpc_id" {
  description = "VPC ID used for EKS cluster"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnets used for worker nodes"
  value       = module.vpc.private_subnets
}
