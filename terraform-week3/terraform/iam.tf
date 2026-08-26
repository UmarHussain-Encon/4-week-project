# ======================================================
# LAMBDA TRUST POLICY
# ======================================================

data "aws_iam_policy_document" "lambda_trust" {

  statement {

    effect =
      "Allow"


    actions = [

      "sts:AssumeRole"
    ]


    principals {

      type =
        "Service"


      identifiers = [

        "lambda.amazonaws.com"
      ]
    }
  }
}


# ======================================================
# MAIN LINK DYNAMODB LAMBDA ROLE
# ======================================================

resource "aws_iam_role" "link_dynamodb" {

  name =
    var.link_dynamodb_role_name


  assume_role_policy =
    data.aws_iam_policy_document
      .lambda_trust
      .json
}


resource "aws_iam_role_policy_attachment" "link_dynamodb_logs" {

  role =
    aws_iam_role
      .link_dynamodb
      .name


  policy_arn =
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


resource "aws_iam_role_policy" "link_dynamodb_access" {

  name =
    "umar-coldchain-LinkDynamoDB-access-terraform"


  role =
    aws_iam_role
      .link_dynamodb
      .id


  policy =
    jsonencode({

      Version =
        "2012-10-17"


      Statement = [

        {

          Effect =
            "Allow"


          Action = [

            "dynamodb:PutItem",

            "dynamodb:GetItem",

            "dynamodb:Query",

            "dynamodb:UpdateItem",

            "dynamodb:DeleteItem"
          ]


          Resource =
            aws_dynamodb_table
              .readings
              .arn
        },

        {

          Effect =
            "Allow"


          Action = [

            "sns:Publish"
          ]


          Resource =
            aws_sns_topic
              .excursions
              .arn
        }
      ]
    })
}


# ======================================================
# EXCURSION HANDLER ROLE
# ======================================================

resource "aws_iam_role" "excursion_handler" {

  name =
    var.excursion_handler_role_name


  assume_role_policy =
    data.aws_iam_policy_document
      .lambda_trust
      .json
}


resource "aws_iam_role_policy_attachment" "excursion_handler_logs" {

  role =
    aws_iam_role
      .excursion_handler
      .name


  policy_arn =
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


resource "aws_iam_role_policy" "excursion_handler_access" {

  name =
    "umar-coldchain-excursion-handler-access-terraform"


  role =
    aws_iam_role
      .excursion_handler
      .id


  policy =
    jsonencode({

      Version =
        "2012-10-17"


      Statement = [

        {

          Effect =
            "Allow"


          Action = [

            "sqs:ReceiveMessage",

            "sqs:DeleteMessage",

            "sqs:GetQueueAttributes"
          ]


          Resource =
            aws_sqs_queue
              .alert_queue
              .arn
        },

        {

          Effect =
            "Allow"


          Action = [

            "dynamodb:GetItem",

            "dynamodb:UpdateItem"
          ]


          Resource =
            aws_dynamodb_table
              .readings
              .arn
        }
      ]
    })
}