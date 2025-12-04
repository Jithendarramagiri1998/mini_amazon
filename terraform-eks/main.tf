#####################################
# VPC MODULE
#####################################

module "vpc" {
  source = "./modules/vpc"

  cluster_name = var.cluster_name
}

#####################################
# EKS MODULE
#####################################

module "eks" {
  source = "./modules/eks"

  cluster_name = var.cluster_name
  node_type    = var.node_type

  desired_size = var.desired_size
  min_size     = var.min_size
  max_size     = var.max_size

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
}
