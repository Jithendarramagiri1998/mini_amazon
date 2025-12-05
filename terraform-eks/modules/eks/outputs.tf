output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks_cluster.cluster_name
}

output "cluster_endpoint" {
  description = "EKS API endpoint"
  value       = module.eks_cluster.cluster_endpoint
}

output "cluster_ca_certificate" {
  description = "Cluster CA certificate"
  value       = module.eks_cluster.cluster_certificate_authority_data
}

output "node_group_role_arn" {
  description = "Node group IAM role ARN"
  value       = module.eks_cluster.eks_managed_node_groups.default.iam_role_arn
}
