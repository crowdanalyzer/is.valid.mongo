var expect = require('chai').expect;
var mongo = require('mongodb-connect');
var Validate = require(__dirname + '/../lib/is.valid.mongo');
var config = {
	mongodb: {
		host: '127.0.0.1',
		port: 27017,
		db: 'is_valid_mongo_test'
	}
};

describe('validate', function(){

	var mongodb;

	before(function(done){
		mongo.connect(config.mongodb, function(err, db){
			mongodb = db;
			mongodb.dropDatabase();
			mongodb.collection('validations').update({'email': 'bahaa.galal@crowdanalyzer.com'}, {'email': 'bahaa.galal@crowdanalyzer.com', 'delete_flag': '0'}, {safe: true, upsert: true}, function(err, success){
				mongodb.collection('validations').update({'user': {'email': 'bahaa@crowdanalyzer.com'}}, {'user': {'email': 'bahaa@crowdanalyzer.com'}, 'delete_flag': '0'}, {safe: true, upsert: true}, function(err, success){
					done();
				});
			});
		});
	});

	describe('init', function(){

		it('should initialize error messages for except, unique, uniqueExcept rules', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			expect(validate.errorMessages).to.have.property('exists');
			expect(validate.errorMessages).to.have.property('unique');
			expect(validate.errorMessages).to.have.property('uniqueExcept');
			expect(validate.errorMessages['exists']).to.be.equal('%s doesn\'t exist.');
			expect(validate.errorMessages['unique']).to.be.equal('%s isn\'t unique.');
			expect(validate.errorMessages['uniqueExcept']).to.be.equal('%s isn\'t unique.');
			done();
		});

		it('should add except, unique and uniqueExcept rules to the optionable rules array', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			expect(validate.rulesWithOptions[validate.rulesWithOptions.length - 3]).to.be.equal('exists');
			expect(validate.rulesWithOptions[validate.rulesWithOptions.length - 2]).to.be.equal('unique');
			expect(validate.rulesWithOptions[validate.rulesWithOptions.length - 1]).to.be.equal('uniqueExcept');
			done();
		});
	});

	describe('exists', function(){

		it('should return false if the value provided doesn\'t exist in the database', function(done){
			var validate = new Validate({
				email: 'bahaa@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|exists[validations.email]');
			validate.run(function(err, data){
				expect(err).to.not.be.null;
				expect(err).to.be.an('object');
				expect(err).to.have.property('email');
				expect(err.email).to.be.equal('email doesn\'t exist.');
				done();
			});
		});

		it('should be able to track complex inside object validation', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|exists[validations.user.email]');
			validate.run(function(err, data){
				expect(err).to.not.be.null;
				expect(err).to.be.an('object');
				expect(err).to.have.property('email');
				expect(err.email).to.be.equal('email doesn\'t exist.');
				done();
			});
		});

		it('should return true if email exists', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|exists[validations.email]');
			validate.run(function(err, data){
				expect(err).to.be.null;
				done();
			});
		});

		it('should return true if user.email exists', function(done){
			var validate = new Validate({
				email: 'bahaa@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|exists[validations.user.email]');
			validate.run(function(err, data){
				expect(err).to.be.null;
				done();
			});
		});
	});

	describe('unique', function(){

		it('should return false if the value provided does exist in the database', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|unique[validations.email]');
			validate.run(function(err, data){
				expect(err).to.not.be.null;
				expect(err).to.be.an('object');
				expect(err).to.have.property('email');
				expect(err.email).to.be.equal('email isn\'t unique.');
				done();
			});
		});

		it('should be able to track nested objects', function(done){
			var validate = new Validate({
				email: 'bahaa@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|unique[validations.user.email]');
			validate.run(function(err, data){
				expect(err).to.not.be.null;
				expect(err).to.be.an('object');
				expect(err).to.have.property('email');
				expect(err.email).to.be.equal('email isn\'t unique.');
				done();
			});
		});

		it('should return true if email is unique', function(done){
			var validate = new Validate({
				email: 'bahaa@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|unique[validations.email]');
			validate.run(function(err, data){
				expect(err).to.be.null;
				done();
			});
		});

		it('should return true if user.email is unique', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|unique[validations.user.email]');
			validate.run(function(err, data){
				expect(err).to.be.null;
				done();
			});
		});

		it('should return error if id isn\'t mongo id', function(done){
			var validate = new Validate({
				_id: '1234567890'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('_id', 'id', 'required|unique[validations._id]');
			validate.run(function(err, data){
				expect(err).to.not.be.null;
				expect(err).to.be.an('object');
				expect(err).to.have.property('_id');
				expect(err._id).to.be.equal('id isn\'t unique.');
				done();
			});
		});
	});

	describe('uniqueExcept', function(){

		it('should return false if the value provided does exist in the database and the exception codition isn\'t matching', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|uniqueExcept[validations.email.delete_flag.1]');
			validate.run(function(err, data){
				expect(err).to.not.be.null;
				expect(err).to.be.an('object');
				expect(err).to.have.property('email');
				expect(err.email).to.be.equal('email isn\'t unique.');
				done();
			});
		});

		it('should return true if email is unique with only one exception', function(done){
			var validate = new Validate({
				email: 'bahaa.galal@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|uniqueExcept[validations.email.delete_flag.0]');
			validate.run(function(err, data){
				expect(err).to.be.null;
				done();
			});
		});

		it('should return true if email is unique', function(done){
			var validate = new Validate({
				email: 'bahaa@crowdanalyzer.com'
			});

			validate.setDBDriver(mongodb);
			validate.addRule('email', 'email', 'required|uniqueExcept[validations.email.delete_flag.1]');
			validate.run(function(err, data){
				expect(err).to.be.null;
				done();
			});
		});
	});
});
