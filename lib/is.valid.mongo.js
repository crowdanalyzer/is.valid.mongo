var util = require('util');
var IsValid = require('is.valid');
var Mongo = require('mongodb');

Validate = function(data, errorMessages){
	IsValid.call(this, data, errorMessages);
};

Validate.prototype = new IsValid;

Validate.prototype.setDBDriver = function(db){
	this.mongodb = db;
};

/**
  * add error messages to exists / unique / uniqueExcept rules
 **/
Validate.prototype.errorMessages.exists = '%s doesn\'t exist.';
Validate.prototype.errorMessages.unique = '%s isn\'t unique.';
Validate.prototype.errorMessages.uniqueExcept = '%s isn\'t unique.';

/**
  * exists, unique and uniqueExcept are rules that require options
 **/
Validate.prototype.rulesWithOptions.push('exists', 'unique', 'uniqueExcept');


/**
	exists
	options[0] collection
	options[1] field
	context
	options[2] anotherField
	options[3] anotherValue
	check if some value exists in the db
 **/
Validate.prototype.exists = function(value, options, callback){
	opts = options.shift().split('.');

	var collection = opts[0];
	var property = opts[1];
	var contextProperty = opts[2];
	var contextValue = opts[3];

	var where = {};

	try
	{
		if(property == '_id')
			value = new Mongo.ObjectID(value);
	}
	catch(e)
	{
		return callback(false, options);
	}

	where[property] = value;

	if(contextProperty && contextValue)
	{
		try
		{
			if(contextProperty == '_id')
				contextValue = new Mongo.ObjectID(contextValue);
		}
		catch(e)
		{
			return callback(false, options);
		}

		where[contextProperty] = contextValue;
	}

	this.mongodb.collection(collection).find(where).count(function(err, count){
		if(err)
			return callback(false, options);
		return callback(Boolean(count), options);
	});
};

/**
	unique
	options[0] collection
	options[1] field
	context
	options[2] anotherField
	options[3] anotherValue
	check if value didn't exist before in the db
 **/
Validate.prototype.unique = function(value, options, callback){
	opts = options.shift().split('.');

	var collection = opts[0];
	var property = opts[1];
	var contextProperty = opts[2];
	var contextValue = opts[3];

	var where = {};

	try
	{
		if(property == '_id')
			value = new Mongo.ObjectID(value);
	}
	catch(e)
	{
		return callback(false, options);
	}


	where[property] = value;

	if(contextProperty && contextValue)
	{
		try
		{
			if(contextProperty == '_id')
				contextValue = new Mongo.ObjectID(contextValue);
		}
		catch(e)
		{
			return callback(false);
		}

		where[contextProperty] = contextValue;
	}

	this.mongodb.collection(collection).find(where).count(function(err, count){
		if(err)
			return callback(false, options);
		return callback(!Boolean(count), options);
	});
};

/**
	uniqueExcept
	options[0] collection
	options[1] field
	options[2] exceptionField
	options[3] exceptionValue
	check if value didn't exist before in the db holding an exception in mind
 **/
Validate.prototype.uniqueExcept = function(value, options, callback){
	var opts = options.shift().split('.');

	var collection = opts[0];
	var property = opts[1];
	var exceptionProperty = opts[2];
	var exceptionValue = opts[3];

	var where = {};

	try
	{
		if(property == '_id')
			value = new Mongo.ObjectID(value);
	}
	catch(e)
	{
		return callback(false, options);
	}

	where[property] = value;

	try
	{
		if(exceptionProperty == '_id')
			exceptionValue = new Mongo.ObjectID(exceptionValue);
	}
	catch(e)
	{
		return callback(false, options);
	}

	where[exceptionProperty] = { $ne: exceptionValue};

	this.mongodb.collection(collection).find(where).count(function(err, count){
		if(err)
			return callback(false, options);
		return callback(!Boolean(count), options);
	});
};

module.exports = Validate;
