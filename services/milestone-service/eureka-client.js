import { Eureka } from 'eureka-js-client';

const eurekaClient = new Eureka({
  instance: {
    app: 'backend-service',
    hostName: 'localhost',
    ipAddr: '127.0.0.1',
    statusPageUrl: 'http://localhost:9090',
    healthCheckUrl: 'http://localhost:9090/health',
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
    // Add authentication credentials if required
    username: process.env.EUREKA_USERNAME || 'admin',
    password: process.env.EUREKA_PASSWORD || 'password',
  },
});

eurekaClient.start((error) => {
  if (error) {
    console.error('❌ Eureka registration failed:', error);
    console.log('⚠️  Continuing without Eureka registration. Backend service will still work.');
  } else {
    console.log('✅ Successfully registered with Eureka Server');
  }
});

export default eurekaClient;
