const { Kafka } = require('kafkajs')
const protobuf = require('protobufjs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['rp-01.internal.stgvms.allofresh.com:9092', 'rp-02.internal.stgvms.allofresh.com:9092', 'rp-03.internal.stgvms.allofresh.com:9092'],
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const something = async () => {
  try {
    await consumer.connect()
    await consumer.subscribe({ topic: 'product-producer.price', fromBeginning: true })

    const root = await protobuf.load('something.proto')

    const PriceEventMessage = root.lookupType('something.UpdateProductPricingJob')

    let i = 0

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          value: PriceEventMessage.decode(message.value),
          index: i
        })
        i++
      },
    })
  } catch (err) {
    console.log('===> ' + err)
  }
}

something()
