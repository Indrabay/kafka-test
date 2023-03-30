const { Kafka } = require('kafkajs')
const protobuf = require('protobufjs')
// const googleProtobuf = require('google-protobuf')
const { v4: uuidv4 } = require('uuid');
const brokers = 'rp-01.internal.stgvms.allofresh.com:9092,rp-02.internal.stgvms.allofresh.com:9092,rp-03.internal.stgvms.allofresh.com:9092'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: brokers.split(','),
})

const producer = kafka.producer()

const something = async () => {
  let messages = [];
  const rootMessage = await protobuf.load('something.proto')

  const PriceEventMessage = rootMessage.lookupType('something.UpdateProductPricingJob')

  const timeMs = Date.now()

  let timestamp = {
    seconds: Math.floor(timeMs / 1000),
    nanos: (timeMs % 1000) * 1e6
  }

  // date.fromDate(new Date())

  console.log(timestamp)

  const payload = {
    meta: {
      eventId: uuidv4(),
      serviceName: 'product-producer',
      createdAt: timestamp
    },
    payload: {
      itemCode: "BG030092001",
      itemName: "CLARIS POT BUNGA FLORENCE 35 CM 5835",
      supplierName: "DC X-DOCK CKG LT 3 TRI (TEMP)",
      supplierCode: "9910",
      storeCode: "10051",
      normalSellingPrice: 111000,
      normalPurchasePrice: 59383
    }
  }

  let err = PriceEventMessage.verify(payload)
  console.log(err)
  // if (err) {
  //   throw err
  // }
  const message = PriceEventMessage.create(payload)
  const buffer = PriceEventMessage.encode(payload).finish()

  // messages.push(buffer)

  console.log(message)
  console.log(payload)
  console.log(buffer)
  console.log(PriceEventMessage.decode(buffer))

  await producer.connect()
  await producer.send({
    topic: 'product-producer.price',
    messages: [
      { value: buffer },
    ],
  })

  await producer.disconnect()
}

something()
