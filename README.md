# Is.Valid.Mongo

Extend [is.valid](https://github.com/bahaagalal/is.valid) library to validate objects that are saved to Mongo DB Server

## How to use

Install from npm

```bash
npm install is.valid.mongo --save
```
Refer to [is.valid](https://github.com/bahaagalal/is.valid) documentation to see how to use the lib and a list of supported validation methods

## New Validation functions

**exists[collection_name.field]**: validates that there is at least one document in a certain collection that has the value supplied in the field selected.

**unique[collection_name.field]**: validates that the documents in a certain collection have never seen the value supplied in the field selected.

**uniqueExcept[collection_name.field.another_field.another_value]**: validates that the documents in a certain collection have never seen the value supplied in the field selected excluding documents that match the condition (another_field = another_value).
