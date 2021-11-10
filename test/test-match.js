const { artifacts } = require("hardhat");

const DummyERC20Token = artifacts.require('DummyERC20Token');
const StaticCallProxy = artifacts.require('StaticCallProxy');
const BridgeAdapter = artifacts.require('BridgeAdapter');
const FullMigration = artifacts.require('FullMigration');
const ZeroEx = artifacts.require('ZeroEx');
const IZeroEx = artifacts.require('IZeroEx');
const FeeCollectorController = artifacts.require('FeeCollectorController');
const TransformERC20Feature = artifacts.require('TransformERC20Feature');
const NativeOrdersFeature = artifacts.require('NativeOrdersFeature');
const MatchOrdersFeature = artifacts.require('MatchOrdersFeature');
const LimitOrderFeature = artifacts.require('LimitOrderFeature');
const SimpleFunctionRegistryFeature = artifacts.require('SimpleFunctionRegistryFeature');
const OwnableFeature = artifacts.require('OwnableFeature');
const WethTransformer = artifacts.require('WethTransformer');
const PayTakerTransformer = artifacts.require('PayTakerTransformer');
const AffiliateFeeTransformer = artifacts.require('AffiliateFeeTransformer');
const FillQuoteTransformer = artifacts.require('FillQuoteTransformer');
const PositiveSlippageFeeTransformer = artifacts.require('PositiveSlippageFeeTransformer');
const {Contract, providers, Wallet, ethers } = require("ethers");




const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const etherToken = {
  'address': '0x4fac0386c4045b52756b206db3148201e42b3f62'
};


contract('TestMultipleMatch', function (accounts) {

  it('init', async () => {

    const zrxToken = await DummyERC20Token.new("0x Protocol Token", "ZRX", 18, "1000000000000000000000000000");
    const abcToken = await DummyERC20Token.new("ABC TOKEN", "ABC", 18, "1000000000000000000000000000");
    const staticCallProxy = await StaticCallProxy.new();
    const bridgeAdapter = await BridgeAdapter.new(etherToken.address);
    const migrator = await FullMigration.new(accounts[0]);
    const getBootstrapper = await migrator.getBootstrapper();
    const zeroEx = await ZeroEx.new(getBootstrapper);
    
    
    const _config = {
      zeroExAddress: zeroEx.address,
      wethAddress: etherToken.address,
      stakingAddress: NULL_ADDRESS,
      protocolFeeMultiplier: '100',
      transformerDeployer: accounts[0]
    }
    
    const feeCollectorController = await FeeCollectorController.new(etherToken.address, _config.stakingAddress);
    const transformERC20 = await TransformERC20Feature.new();
    const nativeOrders = await NativeOrdersFeature.new(_config.zeroExAddress, _config.wethAddress, _config.stakingAddress, feeCollectorController.address, _config.protocolFeeMultiplier);
    const matchOrders = await MatchOrdersFeature.new(_config.zeroExAddress);
    const limitOrder = await LimitOrderFeature.new(_config.zeroExAddress);
    const registry = await SimpleFunctionRegistryFeature.new();
    const ownable = await OwnableFeature.new();
    
    
    const _features = {
      registry: registry.address,
      ownable: ownable.address,
      transformERC20: transformERC20.address,
      nativeOrders: nativeOrders.address,
      matchOrders: matchOrders.address,
      limitOrder: limitOrder.address
    };
    
    await migrator.migrateZeroEx(accounts[0], zeroEx.address, _features, _config);
    
    const exchangeProxy = IZeroEx.at(zeroEx.address);
    const wethTransformer = await WethTransformer.new(etherToken.address);
    const payTakerTransformer = await PayTakerTransformer.new();
    const affiliateFeeTransformer = await AffiliateFeeTransformer.new();
    const fillQuoteTransformer = await FillQuoteTransformer.new(bridgeAdapter.address, zeroEx.address);
    const positiveSlippageFeeTransformer = await PositiveSlippageFeeTransformer.new();


    const sellOrder = [
      {
        makerToken: '0xfE6CDcF78b4FF1630F4fb0e6Ca7B37549D9421bD',
        takerToken: '0x1b95c683d67f0a3affdff3fc47a987e5f6407d74',
        makerAmount: '999100000000000000',
        takerAmount: '999100000000000000',
        maker: '0xF54b3294616d39749732Ac74F234F46C9ABf29C4',
        taker: '0x0000000000000000000000000000000000000000',
        pool: '0x04de57b08dbcf48bf42ab537dda477893412755142e450e09e80d95180bd3334',
        expiry: '1673527017',
        salt: '25031227584749575483953055655851856791272068567705208291812057886500504501498',
        chainId: 97,
        verifyingContract: '0x178712f981AA217Cb0a95aaB65e4268aA51DD370',
        takerTokenFeeAmount: '900000000000000',
        sender: '0x2D4159A016fD5318da2057a2173d48Dc11af314e',
        feeRecipient: '0x0000000000000000000000000000000000000000'
      }
    ];

    const buyOrder = [
      {
        makerToken: '0x1b95c683d67f0a3affdff3fc47a987e5f6407d74',
        takerToken: '0xfE6CDcF78b4FF1630F4fb0e6Ca7B37549D9421bD',
        makerAmount: '19982000000000000000',
        takerAmount: '1998200000000000000',
        maker: '0xF54b3294616d39749732Ac74F234F46C9ABf29C4',
        taker: '0x0000000000000000000000000000000000000000',
        pool: '0x629ffa4d5f75b8e04fa096c8c806ae25a8e2e21b43238498acaf2dd470575742',
        expiry: '1673527017',
        salt: '105226371954069819702526198361443243801494666386041090177450248817788688940291',
        chainId: 97,
        verifyingContract: '0x178712f981AA217Cb0a95aaB65e4268aA51DD370',
        takerTokenFeeAmount: '18000000000000000',
        sender: '0x2D4159A016fD5318da2057a2173d48Dc11af314e',
        feeRecipient: '0x0000000000000000000000000000000000000000'
      }
    ]

    const sellSignature = [
      {
        v: 27,
        r: '0x5ea834f0678c5ae787a151c515369f962cc59e4ad3a4246c6cadf6d0ebbea7c6',
        s: '0x1b1280bfb04d932761ff06e091a0fbb42055503eec883d94efea3291b366c562',
        signatureType: 2
    
      }
    ]


    const buySignature = [
      {
        v: 28,
        r: '0xdd0357c315becda02cfcc50268a2bdabcb41627a4e80166b4efa2453989d1ea9',
        s: '0x3dd3f4d7385c1e0c596bbc2a9bd2a267de43ebccc8d9f1102ba2e4a6a4887cd5',
        signatureType: 2
  
      }
    ]

    const sellType = [1];
    const buyType = [1];
    const price = ['100000000000'];


    console.log(exchangeProxy);

    // const provider = new providers.JsonRpcProvider(NETWORK_CONFIGS.rpcUrl);
    // const zeroExContract = new Contract(
    //   zeroEx.address,

    // )

    // const match = await exchangeProxy.matchOrders(
    //   JSON.parse(JSON.stringify(sellOrder)),
    //   JSON.parse(JSON.stringify(buyOrder)),
    //   sellSignature,
    //   buySignature,
    //   price,
    //   '1',
    //   '1'
    // );

    // console.log(match);

    const matchBatch = await exchangeProxy.batchMatchOrders({
      sellOrder: sellOrder,
      buyOrder: buyOrder,
      sellSignature: sellSignature,
      buySignature: buySignature,
      price: price,
      sellType: sellType,
      buyType: buyType
    }, 
    {value: 0.01});
    console.log(matchBatch);
  })


});


