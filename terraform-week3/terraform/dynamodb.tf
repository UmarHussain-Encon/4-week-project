resource "aws_dynamodb_table" "readings" {

  name =
    var.dynamodb_table_name


  billing_mode =
    "PAY_PER_REQUEST"


  hash_key =
    "branchId"


  range_key =
    "readingKey"


  attribute {

    name =
      "branchId"

    type =
      "S"
  }


  attribute {

    name =
      "readingKey"

    type =
      "S"
  }
}