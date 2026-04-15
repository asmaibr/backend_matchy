import { Eureka } from 'eureka-js-client';

const eurekaClient = new Eureka({
  instance: {
    app: 'backend-service',
    hostName: 'localhost',
    ipAddr: '127.0.0.1',
    port: {
      '$': 9090,
      '@enabled': true,
    },
    vipAddress: 'backend-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/',
  },
});

eurekaClient.start((error) => {
  if (error) {
    console.error('❌ Eureka registration failed:', error);
  } else {
    console.log('✅ Successfully registered with Eureka Server');
  }
});

export default eurekaClient;
