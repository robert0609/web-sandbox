const expect = chai.expect;

describe('main_test', function () {
  before(function () {
    // 在本区块的所有测试用例之前执行
  });

  after(function () {
    // 在本区块的所有测试用例之后执行
  });

  beforeEach(function () {
    // 在本区块的每个测试用例之前执行
  });

  afterEach(function () {
    // 在本区块的每个测试用例之后执行
  });

  it('should_be_executed_correctly', () => {
    let result = 'Hello world!';
    expect(result).to.be.equal('Hello world!');
  });
});
