// external packages
const express = require("express")
require("dotenv").config("./env")
const test = require("./test")
const WA = require("./wati")
const airtable = require("./update")
// const outro = require('./outroflow');

const webApp = express()

webApp.use(express.json())

// Route for WhatsApp
webApp.post("/web", async (req, res) => {
  const senderID = req.body.waId

  const keyword = req.body.text || ""

  console.log(req.body)

  const id = await airtable
    .getID(senderID)
    .then()
    .catch((e) => console.log(e))
  const last_msg = await airtable
    .findLastMsg(senderID)
    .then()
    .catch((e) => console.log("last msg error " + e))
  const currentDay = await airtable
    .findField("Next Day", senderID)
    .then()
    .catch((e) => console.log("current day error" + e))
  const current_module = await airtable
    .findField("Next Module", senderID)
    .then()
    .catch((e) => console.log("current day error" + e))
  console.log(currentDay, current_module)

  if (req.body.listReply != null) {
    reply = JSON.parse(JSON.stringify(req.body.listReply))
    console.log("List msg")

    await test
      .store_responses(senderID, reply.title)

      .then()
      .catch((e) => console.log("Finish List error " + e))
  } else if (keyword == `Let's Begin`) {
    // console.log("Finish start template error " + keyword)
    test
      .findModule(currentDay, current_module, senderID)
      .then()
      .catch((e) => console.log("Let's begin keyword error " + e))
  } else if (keyword == "Start Day") {
    console.log("Finish start template error " + keyword)
    test
      .sendModuleContent(senderID)
      .then()
      .catch((e) => console.log("Finish start template error " + e))
  }

  // else if (keyword.includes("Finish Day ") || keyword.includes("समाप्त करें")) {

  //     console.log("A. Updating finish day")

  //     airtable.updateField(id, "Last_Msg", keyword)
  //     test.markDayComplete(senderID).then().catch(e => console.info("Finish day template error " + e))

  // }
  else if (keyword == "Next." || keyword == "नेक्स्ट") {
    test
      .markModuleComplete(senderID)
      .then()
      .catch((e) => console.info("Finish module template error " + e))
  } else {
    console.log("Storing for almost 24 h limit ")
    // if (last_msg == "Yes" || last_msg == "हाँ") {
    //     console.log("1. Yes - No")
    //     WA.sendText("Once you complete watching the video, answer the question", senderID)
    //     // await test.store_intResponse(senderID, keyword)
    //     await airtable.updateField(id, "Last_Msg", keyword)
    // }
    // else if (last_msg == "Next." || last_msg == "नेक्स्ट") {
    //     console.log("2. Yes - No")
    //     if (last_msg == "नेक्स्ट") {
    //         console.log("last_msg == नेक्स्ट")
    //         WA.sendText("आपकी प्रतिक्रिया पहले ही दर्ज की जा चुकी है | ", senderID)
    //     }
    //     else {
    //         WA.sendText("Your feedback has already been recorded. ", senderID)
    //     }
    // }
    // else {
    console.log("3. Yes - No")
    await test.store_quesResponse(senderID, keyword)
    // await airtable.updateField(id, "Last_Msg", keyword)
    // }
  }

  res.end()
})

webApp.get("/ping", (req, res) => {
  res.status(200).send("Pong")
})

webApp.listen(process.env.PORT, () => {
  console.log(`Server is up and running at ${process.env.PORT}`)
})
