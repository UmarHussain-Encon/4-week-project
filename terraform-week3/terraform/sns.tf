# ======================================================
# SNS MODULE
# ======================================================

module "sns" {
  source = "./modules/sns"

  topic_name = var.sns_topic_name
}


# ======================================================
# MOVED BLOCK
#
# Tells Terraform that the existing SNS topic has moved
# into the module. This prevents Terraform from trying
# to destroy and recreate the topic.
# ======================================================

moved {
  from = aws_sns_topic.excursions
  to   = module.sns.aws_sns_topic.excursions
}


# ======================================================
# SNS -> SQS SUBSCRIPTION
# ======================================================

resource "aws_sns_topic_subscription" "excursion_to_sqs" {
  topic_arn = module.sns.topic_arn

  protocol = "sqs"

  endpoint = aws_sqs_queue.alert_queue.arn

  raw_message_delivery = true

  depends_on = [
    aws_sqs_queue_policy.allow_sns
  ]
}