const chai = require("chai");
const { expect } = chai; 
const {createSandbox} = require("sinon");
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require("sinon-chai");
const proxyquire = require("proxyquire");
const PromiseFtp = require("promise-ftp");
describe("utils",() => {
	let sandbox;
	let stubsPromiseFtp;
	let promiseFtpProxy;
    
	before(() => {
		chai.use(chaiAsPromised);
		chai.use(sinonChai);
		sandbox = createSandbox();
		stubsPromiseFtp = sandbox.createStubInstance(PromiseFtp);
		promiseFtpProxy = proxyquire("../../utils", {
			"promise-ftp":stubsPromiseFtp
		});
	});
    
	it("should be ok",() => {
		expect(promiseFtpProxy).to.be.ok;
	});
});

