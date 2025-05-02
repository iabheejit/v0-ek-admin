<<<<<<< HEAD
var Airtable = require("airtable")
require("dotenv").config()
const WA = require("./wati")
const us = require("./update")
const sendContent = require("./image")
// const outro = require('./outroflow');
const { info } = require("pdfkit")

// var baseId = new Airtable({ apiKey: process.env.apiKey }).baseId(process.env.baseId);

//Update Day completed field and next day field in Test's table for the given phone number
//Called on Finish day keyword

const tableId = process.env.content_tableID
const student_table = process.env.tableId
const baseId = process.env.baseId
const apiKey = process.env.personal_access_token

async function markDayComplete(number) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${student_table}`

    const params = new URLSearchParams({
      filterByFormula: `({Phone} = "${number}")`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.records || data.records.length === 0) {
      console.log("No records found for the given number")
      return
    }

    const record = data.records[0]
    const id = record.id
    const name = record.fields.Name
    const course = record.fields.Course
    const comp_day = Number(record.fields["Next Day"])
    const nextDay = comp_day + 1

    const total_days = await us.totalDays(number)

    if (comp_day <= total_days) {
      console.log("Entered markDayComplete")

      const updateFields = {
        "Next Day": nextDay,
        "Day Completed": comp_day,
        "Next Module": 1,
        "Module Completed": 0,
      }

      const updateResponse = await fetch(`${url}/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: updateFields }),
      })

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`)
      }

      console.log("Complete Day " + comp_day)

      if (nextDay == total_days + 1) {
        console.log("Executing Outro for ", name, nextDay)
      }
    }
  } catch (error) {
    console.error("Error in markDayComplete:", error)
  }
}

// Find  current day content and called on in sendContent method
async function findDay(currentDay, number) {
  try {
    const course_tn = await us.findTable(number)
    console.log(`Table name of ${number} is ${course_tn}`)

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}`

    const params = new URLSearchParams({
      filterByFormula: `({Day} = ${currentDay})`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.records || data.records.length === 0) {
      console.log("No records found for the given day")
      return
    }

    const record = data.records[0]
    const day = record.fields.Day
    const id = await us.getID(number)
    const total_days = await us.totalDays(number)

    console.log("Entered findDay module")

    if (currentDay == 4) {
      const hTxt = `Congratulations on completing Day ${day}!`
      const bTxt = `_powered by ekatra.one_`
      const btnTxt = "Finish Day " + day

      console.log("5. Updating last message")
      await us.updateField(id, "Last_Msg", hTxt)

      WA.sendText(`${hTxt} \n${bTxt}`, number)
      await markDayComplete(number)

      setTimeout(() => {
        WA.sendText(
          `Would you like another learner to join you? Invite your friends to take the course! 
                
https://bit.ly/TBS-Referral`,
          number,
        )
      }, 5000)
    } else {
      const next_day = day + 1
      const hTxt = `Congratulations on completing Day ${day}!`
      const bTxt = `You will receive Day ${next_day} modules tomorrow. \n\n_powered by ekatra.one_`
      const btnTxt = "Finish Day " + day

      console.log("6. Updating last message")
      await us.updateField(id, "Last_Msg", hTxt)

      console.log("2. Delay of Finish Day")
      WA.sendText(`${hTxt} \n${bTxt}`, number)
      await markDayComplete(number)

      setTimeout(() => {
        WA.sendText(
          `Would you like another learner to join you? Invite your friends to take the course! 

https://bit.ly/TBS-Referral`,
          number,
        )
      }, 5000)
    }
  } catch (error) {
    console.error("Error in findDay:", error)
  }
}

async function sendList(currentDay, module_No, number) {
  try {
    const course_tn = await us.findTable(number)
    const id = await us.getID(number)

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}`

    const params = new URLSearchParams({
      filterByFormula: `({Day} = ${currentDay})`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.records || data.records.length === 0) {
      console.log("No records found for the given day")
      return
    }

    const record = data.records[0]
    const module_title = record.fields[`Module ${module_No} LTitle`]
    const module_list = record.fields[`Module ${module_No} List`]

    console.log("Executing List")
    const options = module_list.split("\n").filter((n) => n)

    const d = options.map((row) => ({ title: row }))

    console.log("8. Updating")
    await us.updateField(id, "Last_Msg", module_title)

    WA.sendListInteractive(d, module_title, "Options", number)
  } catch (error) {
    console.error("Error in sendList:", error)
  }
}

async function sendIMsg(currentDay, module_No, number) {
  var course_tn = await us.findTable(number)

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${course_tn}?filterByFormula=({Day} = ${currentDay})&view=Grid view`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error("Error fetching records:", response.statusText)
    return
  }

  const data = await response.json()
  const records = data.records

  records.forEach((record) => {
    console.log(module_No)
    const module_body = record.fields[`Module ${module_No} iBody`]
    const module_buttons = record.fields[`Module ${module_No} iButtons`]

    console.log("Executing Interactive ")
    const options = module_buttons.split("\n").filter((n) => n)

    const data = options.map((option) => ({ text: option }))

    setTimeout(() => {
      WA.sendDynamicInteractiveMsg(data, module_body, number)
    }, 35000)
  })
}

async function sendQues(currentDay, module_No, number) {
  var course_tn = await us.findTable(number)
  const id = await us
    .getID(number)
    .then()
    .catch((e) => console.log(e))

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${course_tn}?filterByFormula=({Day} = ${currentDay})&view=Grid view`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error("Error fetching records:", response.statusText)
    return
  }

  const data = await response.json()
  const records = data.records

  records.forEach(async (record) => {
    const module_ques = record.fields[`Module ${module_No} Question`]

    console.log("Executing Question ")
    console.log("4. Update as last message ")

    await us.updateField(id, "Last_Msg", `Q: ${module_ques}`)

    setTimeout(() => {
      WA.sendText(module_ques, number)
    }, 2000)

    setTimeout(() => {
      WA.sendText("⬇⁣", number)
    }, 3000)
  })
}

// store_responses(918779171731, "No")
async function store_responses(number, value) {
  const course_tn = await us.findTable(number)
  console.log(value)

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${student_table}?filterByFormula=({Phone} = "${number}")&view=Grid view`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error("Error fetching records:", response.statusText)
    return
  }

  const data = await response.json()
  const records = data.records

  records.forEach(async (record) => {
    const id = record.id
    const currentModule = record.fields["Next Module"]
    const currentDay = record.fields["Next Day"]
    const last_msg = await us
      .findLastMsg(number)
      .then()
      .catch((e) => console.log("last msg error " + e))
    const list = await us
      .findTitle(currentDay, currentModule, number)
      .then()
      .catch((e) => console.error(e))

    const title = list[0]
    const feedback = ["I am not sure", "No, I do not", "Some parts are confusing", "Yes, I do"]
    const correct_ans = await us
      .findAns(currentDay, currentModule, number)
      .then()
      .catch((e) => console.log("Error in findAns ", e))
    // console.log("Correct ans ", correct_ans);
    if (correct_ans == null) {
      console.log("currentDay ", currentDay)
      let existingValues = await us
        .findField("Question Responses", number)
        .then()
        .catch((e) => console.error(e))
      console.log("existingValues 1 ", existingValues, title)

      if (existingValues == 0) {
        console.log("existingValues 2 ")
        existingValues = ""
        newValues = `Q: ${title} \nA: ${value}`
      } else {
        console.log("existingValues 3 ")
        newValues = `${existingValues} \n\nQ: ${title} \nA: ${value}`
      }
      if (existingValues.toString().includes(title)) {
        console.log("2.1 List Feedback already recorded")
        await findContent(currentDay, currentModule, number)
      } else {
        us.updateField(id, "Question Responses", newValues).then(async () => {
          console.log("2.2 List New Feedback recorded")
          await findContent(currentDay, currentModule, number)

          console.log("1. Updating")
          await us.updateField(id, "Last_Msg", title)
        })
      }

      // if (existingValues.includes(`Day ${currentDay} -`)) {
      //     console.log("1.1  User Feedback already recorded");
      //     await findContent(currentDay, currentModule, number);
      // } else {
      //     us.updateField(id, "Feedback", newValues).then(async () => {
      //         console.log("1.2  New User Feedback recorded");
      //         await findContent(currentDay, currentModule, number);

      //         console.log("1. Updating in list feedback");
      //         await us.updateField(id, "Last_Msg", list_title[0]);
      //     });
      // }

      // for (let i = 0; i < feedback.length; i++) {
      // if (value == feedback[i]) {
      //     console.log("Matched ", feedback[i], value);
      //     let score = 0;
      //     switch (value) {
      //         case "I am not sure":
      //             score = 1;
      //             break;
      //         case "No, I do not":
      //             score = 2;
      //             break;
      //         case "Some parts are confusing":
      //             score = 3;
      //             break;
      //         case "Yes, I do":
      //             score = 4;
      //             break;
      //     }

      //     let existingValues = await us.findField("Feedback", number);
      //     console.log("existingValues ", existingValues);

      //     if (existingValues == 0) {
      //         existingValues = "";
      //         newValues = `Day ${currentDay} - ${score}`;
      //     } else {
      //         newValues = `${existingValues} \n\nDay ${currentDay} - ${score}`;
      //     }

      //     if (existingValues.includes(`Day ${currentDay} -`)) {
      //         console.log("1.1  User Feedback already recorded");
      //         await findContent(currentDay, currentModule, number);
      //     } else {
      //         us.updateField(id, "Feedback", newValues).then(async () => {
      //             console.log("1.2  New User Feedback recorded");
      //             await findContent(currentDay, currentModule, number);

      //             console.log("1. Updating in list feedback");
      //             await us.updateField(id, "Last_Msg", list_title[0]);
      //         });
      //     }
      //     break;
      // } else {
      //     console.log("Not Matched ", feedback[i], value);
      // }
      // }
    } else {
      const correct_ans = await us
        .findAns(currentDay, currentModule, number)
        .then()
        .catch((e) => console.log("Error in findAns ", e))
      console.log("Correct ans ", correct_ans)

      const existingValues = await us
        .findField("Question Responses", number)
        .then()
        .catch((e) => console.error(e))
      // console.log("existingValues ", existingValues);

      const list = await us
        .findTitle(currentDay, currentModule, number)
        .then()
        .catch((e) => console.error(e))

      const title = list[0]
      const options = list.filter((v, i) => i !== 0)

      const isCorrect = correct_ans === value
      const isSecondAttempt = last_msg == "Incorrect"

      // console.log(isCorrect, isSecondAttempt, correct_ans == value, value)

      if (isCorrect || isSecondAttempt) {
        const congratsMessages = [
          "Congratulations! You got it right. 🥳",
          "That's the correct answer.Yay! 🎉",
          "Awesome! Your answer is correct. 🎊",
          "Hey, good job! That's the right answer Woohoo! 🤩",
          "Well done! The answer you have chosen is correct. 🎖️",
        ]

        if (isCorrect && !isSecondAttempt) {
          console.log("1st attempt correct!")

          WA.sendText(congratsMessages[Math.floor(Math.random() * congratsMessages.length)], number)
          console.log(`${title} 1st attempt correct`)
        } else if (isSecondAttempt) {
          console.log("correct_ans == value ", isCorrect, correct_ans, value)
          if (isCorrect) {
            // console.log(" Congrats ", congratsMessages[Math.floor(Math.random() * congratsMessages.length)])
            WA.sendText(congratsMessages[Math.floor(Math.random() * congratsMessages.length)], number)
          } else {
            WA.sendText(`The correct answer is *${correct_ans}*`, number)
          }
        }

        const selectedOption = options[0].find((option) => option === value)
        if (selectedOption) {
          const newValues = existingValues
            ? `${existingValues}\n\nQ: ${title}\nA: ${value}`
            : `Q: ${title}\nA: ${value}`

          if (existingValues.includes(title)) {
            console.log("2.1 List Feedback already recorded")
            await findContent(currentDay, currentModule, number)
          } else {
            await us.updateField(id, "Question Responses", newValues)
            console.log("2.2 List New Feedback recorded")
            await findContent(currentDay, currentModule, number)
            console.log("1. Updating")
            await us.updateField(id, "Last_Msg", title)
          }
        }
      } else {
        WA.sendText(
          "You've entered the wrong answer. Let's try one more time. \n\nSelect the correct option from the list again.",
          number,
        )
        await us.updateField(id, "Last_Msg", "Incorrect")
      }

      //         if (correct_ans == value || last_msg == "Incorrect") {

      //         if (correct_ans == value && last_msg != "Incorrect")  {
      //             var items = [
      //                 'Congratulations! You got it right. 🥳',
      //                 'That’s the correct answer. Yay! 🎉',
      //                 'Awesome! Your answer is correct. 🎊',
      //                 'Hey, good job! That’s the right answer Woohoo! 🤩',
      //                 'Well done! The answer you have chosen is correct. 🎖️'
      //             ];

      //             var item = items[Math.floor(Math.random() * items.length)];
      //             WA.sendText(item, number);

      //             console.log(`${title} 1st attempt correct`);
      //             if (title.includes(last_msg) || last_msg == title) {
      //                 for (let i = 0; i < options[0].length; i++) {
      //                     if (options[0][i] == value) {
      //                         if (existingValues == 0) {
      //                             existingValues = "";
      //                             newValues = `Q: ${title} \nA: ${value}`;
      //                         } else {
      //                             newValues = `${existingValues} \n\nQ: ${title} \nA: ${value}`;
      //                         }

      //                         if (existingValues.includes(title)) {
      //                             console.log("2.1 List Feedback already recorded");
      //                             await findContent(currentDay, currentModule, number);
      //                         } else {
      //                             us.updateField(id, "Question Responses", newValues).then(async () => {
      //                                 console.log("2.2 List New Feedback recorded");
      //                                 await findContent(currentDay, currentModule, number);
      //                                 console.log("1. Updating");
      //                                 await us.updateField(id, "Last_Msg", title);
      //                             });
      //                         }
      //                     }
      //                 }
      //             } else {
      //                 console.log("Feedback already stored");
      //             }}
      //             else if (last_msg == "Incorrect")   {
      //             console.log("correct_ans == value ", correct_ans == value, correct_ans, value);
      //             if (correct_ans == value) {
      //                 console.log("correct_ans == value ", correct_ans == value);
      //                 var items = [
      //                     'Congratulations! You got it right. 🥳',
      //                     'That’s the correct answer. Yay! 🎉',
      //                     'Awesome! Your answer is correct. 🎊',
      //                     'Hey, good job! That’s the right answer Woohoo! 🤩',
      //                     'Well done! The answer you have chosen is correct. 🎖️'
      //                 ];

      //                 var item = items[Math.floor(Math.random() * items.length)];
      //                 WA.sendText(item, number);
      //             } else {
      //                 WA.sendText(`The correct answer is *${correct_ans}*`, number);
      //                 }
      //             }

      //             for (let i = 0; i < options[0].length; i++) {
      //                 if (options[0][i] == value) {
      //                     if (existingValues == 0) {
      //                         existingValues = "";
      //                         newValues = `Q: ${title} \nA: ${value}`;
      //                     } else {
      //                         newValues = `${existingValues} \n\nQ: ${title} \nA: ${value}`;
      //                     }

      //                     console.log("existingValues ", existingValues);
      //                     if (existingValues.includes(title)) {
      //                         console.log("2.1 List Feedback already recorded");
      //                         await findContent(currentDay, currentModule, number);
      //                     } else {
      //                         us.updateField(id, "Question Responses", newValues).then(async () => {
      //                             console.log("2.2 List New Feedback recorded");
      //                             await findContent(currentDay, currentModule, number);

      //                             console.log("1. Updating");
      //                             await us.updateField(id, "Last_Msg", title);
      //                         });
      //                     }
      //                 }
      //             }
      //         }
      //         else {

      //             WA.sendText("You've entered the wrong answer. Let's try one more time. \n\nSelect the correct option from the list again.", number);
      //             await us.updateField(id, "Last_Msg", "Incorrect");

      //         }
    }
  })
}
async function store_intResponse(number, value) {
  const course_tn = await us.findTable(number)

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${student_table}?filterByFormula=({Phone} = "${number}")&view=Grid view`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error("Error fetching records:", response.statusText)
    return
  }

  const data = await response.json()
  const records = data.records

  records.forEach(async (record) => {
    const id = record.id
    const module_complete = record.fields["Module Completed"]
    const currentModule = record.fields["Next Module"]
    const currentDay = record.fields["Next Day"]
    const last_msg = record.fields["Last_Msg"]

    let existingValues = await us
      .findField("Interactive_Responses", number)
      .then()
      .catch((e) => console.log("e2", e))

    const list = await us
      .findInteractive(currentDay, currentModule, number)
      .then()
      .catch((e) => console.error(e))

    if (list != undefined) {
      const title = list[0]
      console.log(title)

      const options = list.filter((v, i) => i !== 0)

      console.log("Value ", value)
      console.log("Last Msg = ", existingValues)
      console.log()

      for (let i = 0; i < options[0].length; i++) {
        if (options[0][i] == value) {
          let newValues
          if (existingValues == 0) {
            existingValues = ""
            newValues = title + "\n" + value
          } else {
            newValues = existingValues + "\n\n" + title + value
          }

          if (existingValues.includes(title)) {
            console.log("Interactive Feedback already recorded")
            await find_IntContent(currentDay, currentModule, number)
          } else {
            us.updateField(id, "Interactive_Responses", newValues).then(async () => {
              console.log("New Interactive Feedback recorded")
              await find_IntContent(currentDay, currentModule, number)
            })
          }
          break
        }
      }
    } else {
      console.log("List empty")
    }
  })
}

async function store_quesResponse(number, value) {
  // var course_tn = await us.findTable(number)

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${student_table}?filterByFormula=({Phone} = ${number})&view=Grid view`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error("Error fetching records:", response.statusText)
    return
  }

  const data = await response.json()
  const records = data.records

  records.forEach(async (record) => {
    const id = record.id
    const currentModule = record.fields["Next Module"]
    const currentDay = record.fields["Next Day"]
    let last_msg = record.fields["Last_Msg"]

    if (currentModule !== undefined) {
      let ques = await us
        .findQuestion(currentDay, currentModule, number)
        .then()
        .catch((e) => console.error("Error in store_quesResponse ", e))

      if (typeof last_msg === "string") {
        last_msg = last_msg.replace("Q: ", "")
        console.log("Last msg and question in store_quesResponse ", last_msg, ques)
      }

      if (last_msg === ques) {
        ques = ques.replace("\n\nShare your thoughts!", " ")

        let existingValues = await us.findQuesRecord(id)

        console.log("ques -  ", ques)

        let newValues
        if (ques !== undefined) {
          if (existingValues === undefined) {
            console.log("existingValues", existingValues)
            existingValues = ""
            newValues = `Q: ${ques} \nA: ${value}`
          } else {
            console.log("existingValues")
            newValues = `${existingValues} \n\nQ: ${ques} \nA: ${value}`
          }

          if (existingValues.includes(ques)) {
            console.log("third_last", last_msg)
            last_msg = last_msg.replace("\n\nShare your thoughts!", " ")

            if (last_msg === ques) {
              try {
                console.log("1.1.2 Feedback already recorded")
                await find_QContent(currentDay, currentModule, number)
                  .then()
                  .catch((e) => console.log("Error 1.1.2 Feedback ", e))
              } catch (e) {
                console.log("Caught Error 1.1.2 Feedback ", e)
              }
            } else {
              console.log("1.2 Feedback already recorded")
              await find_QContent(currentDay, currentModule, number)
            }
          } else {
            us.updateField(id, "Responses", newValues).then(async () => {
              console.log("3. New Feedback recorded")
              await find_QContent(currentDay, currentModule, number)
            })
          }
        }
      } else {
        console.log("No ques")
      }
    }
  })
}

async function findContent(currentDay, module_No, number) {
  var course_tn = await us.findTable(number)
  const id = await us
    .getID(number)
    .then()
    .catch((e) => console.log(e))

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${course_tn}?filterByFormula=({Day} = ${currentDay})&view=Grid view`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error("Error fetching records:", response.statusText)
    return
  }

  const data = await response.json()
  const records = data.records

  records.forEach(async (record) => {
    setTimeout(async () => {
      for (let i = module_No + 1; i <= 5; i++) {
        const module_text = record.fields[`Module ${i} Text`]
        const module_list = record.fields[`Module ${i} LTitle`]
        console.log("After ", i)
        if (module_text === undefined && !module_list) {
          console.log(module_text, module_list)
          if (i >= 5) {
            await markModuleComplete_v2(i, number)
              .then()
              .catch((error) => console.log("v2 ", error))
          }
        } else {
          const hTxt = `Let's move forward!`
          const bTxt = `Click Next.`
          const btnTxt = "Next."
          setTimeout(() => {
            console.log("2. Delay of Finish Interactive Button - find_QContent")
            us.updateField(id, "Last_Msg", btnTxt)
            WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
          }, 5000)
          break
        }
      }
    }, 500)
  })
}

async function find_IntContent(currentDay, module_No, number) {
  var course_tn = await us.findTable(number)

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${course_tn}?filterByFormula=({Day} = ${currentDay})&view=Grid view`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error("Error fetching records:", response.statusText)
    return
  }

  const data = await response.json()
  const records = data.records

  records.forEach(async (record) => {
    const module_title = record.fields[`Module ${module_No} LTitle`]
    const id = await us
      .getID(number)
      .then()
      .catch((e) => console.log(e))

    console.log(module_title)

    if (module_title !== undefined) {
      console.log("List not empty in findContent")
      await sendList(currentDay, module_No, number)
    } else {
      setTimeout(async () => {
        for (let i = module_No + 1; i <= 6; i++) {
          const module_text = record.fields[`Module ${i} Text`]
          const module_list = record.fields[`Module ${i} LTitle`]
          console.log("After ", i)
          if (module_text === undefined && !module_list) {
            console.log(module_text, module_list)
            if (i >= 5) {
              await markModuleComplete_v2(i, number)
                .then()
                .catch((error) => console.log("v2 ", error))
            }
          } else {
            const hTxt = `Let's move forward!`
            const bTxt = `Click Next.`
            const btnTxt = "Next."
            console.log("2. Delay of Finish Interactive Button - find_QContent")
            us.updateField(id, "Last_Msg", btnTxt)
            WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
            break
          }
        }
      }, 500)
    }
  })
}

async function find_QContent(currentDay, module_No, number) {
  try {
    // Fetch the course table name
    var course_tn = await us.findTable(number)
    console.log("findModule ", course_tn)

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${course_tn}/?filterByFormula=Day%3D${currentDay}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    )

    // console.log(response)

    if (!response.ok) {
      return "Failed to fetch records from Airtable"
    }

    const data = await response.json()

    const records = data.records
    for (const record of records) {
      console.log("Data 0 ", data)

      console.log("Data 1 ", record.fields)
      // var module_link = record.fields[`Module ${module_No} Link`]?.null;

      const nm = module_No + 1
      const id = await us
        .getID(number)
        .then()
        .catch((e) => console.log(e))

      console.log(module_No, currentDay)
      // let interactive_body = record.fields[`Module ${nm} iBody`];

      // Send module link if it exists
      // if (module_link != null) {
      //     console.log("Module link not empty");
      //     setTimeout(() => {
      //         data = module_link;
      //         WA.sendText(data, number);
      //     }, 2000);
      // }

      console.log("Before ", module_No)

      // Check for interactive body
      // if (interactive_body) {
      //     us.updateField(id, "Next Module", nm);
      //     us.updateField(id, "Module Completed", module_No);
      //     await sendIMsg(currentDay, nm, number);
      // } else {
      setTimeout(async () => {
        for (let i = module_No + 1; i <= 5; i++) {
          console.log("After ", i)

          const module_text = record.fields[`Module ${i} Text`] // Optional chaining to handle null/undefined

          // console.log(`Module ${i} Text:`, module_text || "Not available");

          const module_list = record.fields[`Module ${i} LTitle`] // Optional chaining to handle null/undefined
          // console.log(`Module ${i} LTitle:`, module_list || "Not available")

          if (module_text === undefined && !module_list) {
            console.log(`Module ${i} Text is undefined and Module ${i} LTitle is falsy.`)

            if (i >= 5) {
              await markModuleComplete_v2(i, number).catch((error) => console.log("v2 ", error))
            }
          } else {
            // Assuming you want to send an interactive message when module_text or module_list is available
            const hTxt = `Let's move forward!`
            const bTxt = `Click Next.`
            const btnTxt = "Next."

            setTimeout(() => {
              console.log("1. Delay of Finish Interactive Button - find_QContent")
              us.updateField(id, "Last_Msg", btnTxt)
              WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
            }, 5000)

            break // Exit the loop after sending the interactive message
          }
        }
      }, 3000)
      // }
    }
  } catch (error) {
    console.error("Error in find_QContent:", error)
  }
}

//Find modules

async function findModule(currentDay, module_No, number) {
  var course_tn = await us.findTable(number)
  console.log("findModule ", module_No, currentDay)

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${course_tn}?filterByFormula=Day%3D${currentDay}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    return "Failed to fetch records from Airtable"
  }

  let data = await response.json()
  const records = data.records

  // console.log(records)
  // Process each record
  for (const record of records) {
    const id = await us.getID(number).catch((e) => console.log(e))

    const day = record.fields["Day"]
    const module_text = record.fields[`Module ${module_No} Text`]
    const module_title = record.fields[`Module ${module_No} LTitle`]
    const module_link = record.fields[`Module ${module_No} Link`]
    const module_next_msg = record.fields[`Module ${module_No} next`]
    const interactive_body = record.fields[`Module ${module_No} iBody`]
    const module_ques = record.fields[`Module ${module_No} Question`]
    let module_split = module_text ? module_text.split("#") : []

    // let module_split = []
    if (module_text != undefined) {
      module_split = module_text.split("#")
    }
    console.log("Executing FindModule ")

    if (!module_text && !!module_ques) {
      console.log("Ques not empty - Module Text Empty")

      setTimeout(() => {
        console.log("4. Delay of media in Ques not empty - Module Text Empty ")
        sendContent
          .sendMediaFile(day, module_No, number)
          .then()
          .catch((e) => console.log("Error" + e))
      }, 100)

      await sendQues(currentDay, module_No, number)
    } else if (!!interactive_body && !!module_text) {
      data = module_text

      const index = 0
      console.log("1. Module Split")

      await sendSplitMessages(module_split, index, day, module_No, number)

      if (!!module_link) {
        console.log("1. Module link not null")

        setTimeout(() => {
          WA.sendText(module_link, number)
        }, 2000)

        console.log("7. Update as last message ")

        await us.updateField(id, "Last_Msg", data)
      }
      console.log("8. Update as last message ")

      await us.updateField(id, "Last_Msg", data)

      await sendIMsg(currentDay, module_No, number)
    } else if (!!module_title && !module_text) {
      console.log("!!module_title && !module_text")
      await sendList(currentDay, module_No, number)
    } else if (!!interactive_body && !module_text) {
      console.log("Delay of media in not empty link - interactive not empty")
      sendContent
        .sendMediaFile(day, module_No, number)
        .then()
        .catch((e) => console.log("Error" + e))

      await sendIMsg(currentDay, module_No, number)
    } else if (!!module_text && !module_title) {
      console.log("!!module_text && !module_title ")

      if (!!interactive_body) {
        setTimeout(() => {
          console.log("2. Delay of media in not empty link ")
          sendContent
            .sendMediaFile(day, module_No, number)
            .then()
            .catch((e) => console.log("Error" + e))
        }, 10000)

        await sendIMsg(currentDay, module_No, number)
      }
      // findContent(currentDay, module_No, number)
      else if (!!module_link) {
        data = module_text
        const index = 0

        console.log("2. Split ")
        await sendSplitMessages(module_split, index, day, module_No, number)

        console.log("1. Update as last message ")

        await us.updateField(id, "Last_Msg", data)

        if (!!module_ques) {
          console.log("1. Ques not empty ")

          setTimeout(async () => {
            await sendQues(currentDay, module_No, number)
          }, 5000)
        } else {
          console.log("Module link not empty ")
          setTimeout(() => {
            console.log("3. Delay of link ")
            WA.sendText(module_link, number)
          }, 2500)

          for (let i = module_No + 1; i <= 5; i++) {
            const module_text = record.fields["Module " + i + " Text"]
            console.log("1. After ", i)
            console.log("module_text ", module_text)
            const module_list = record.fields["Module " + i + " LTitle"]

            if (module_text == undefined && !module_list) {
              console.log(module_text)

              if (i >= 5) {
                await markModuleComplete_v2(i, number)
                  .then()
                  .catch((error) => console.log("v2.1 ", error))
              }
            } else {
              const hTxt = module_next_msg
              // const bTxt = Click Next.
              const btnTxt = "Next."

              setTimeout(() => {
                console.log("2. Delay of Finish Interactive Button - Module")
                WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
              }, 0)
              break
            }
          }
        }
      } else {
        const data = module_text

        const index = 0
        console.log("1. module_split")
        await sendSplitMessages(module_split, index, day, module_No, number)

        console.log("2. Update as last message ")
        await us.updateField(id, "Last_Msg", data)

        if (!!module_ques) {
          console.log("2. Ques not empty ")
          setTimeout(async () => {
            await sendQues(currentDay, module_No, number)
          }, 5000)
        } else {
          console.log("Module link null ", module_No)
          const next_m = module_No + 1
          console.log("Module link null nm ", next_m)
          const module_ques = record.fields["Module " + next_m + " Question"]
          const module_text = record.fields["Module " + next_m + " Text"]

          if (!!module_ques && module_text == undefined) {
            console.log("3. Ques not empty ", module_text)

            us.updateField(id, "Next Module", module_No + 1)
            us.updateField(id, "Module Completed", module_No)

            setTimeout(async () => {
              await sendQues(currentDay, module_No + 1, number)
            }, 4000)
          } else {
            setTimeout(async () => {
              for (let i = module_No + 1; i <= 5; i++) {
                const module_text = record.fields["Module " + i + " Text"]
                console.log("1. After ", i)
                const module_list = record.fields["Module " + i + " LTitle"]

                if (module_text == undefined && !module_list) {
                  console.log(module_text, module_ques)

                  if (i >= 5) {
                    await markModuleComplete_v2(i, number)
                      .then()
                      .catch((error) => console.log("v2.1 ", error))
                  }
                } else {
                  let hTxt = ""
                  console.log("Module Next 1 ", module_next_msg)
                  if (module_next_msg != null) {
                    hTxt = module_next_msg
                  } else {
                    hTxt = "To Learn More!"
                  }
                  const bTxt = "Click Next."
                  const btnTxt = "Next."

                  setTimeout(() => {
                    console.log("2. Delay of Finish Interactive Button - FindModule")
                    WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
                  }, 6000)
                  break
                }
              }
            }, 15000)
          }
        }
      }
    } else if (!!module_text && !!module_title) {
      data = module_text

      console.log("3. Update as last message ")
      await us.updateField(id, "Last_Msg", data)

      const index = 0

      await sendSplitMessages(module_split, index, day, module_No, number)

      setTimeout(async () => {
        await sendList(currentDay, module_No, number)
      }, 2000)
    } else {
      markModuleComplete(number)
    }
  }
}

async function sendSplitMessages(module_split, index, day, module_No, number) {
  const awaitTimeout = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

  for (index; index < module_split.length; index++) {
    try {
      console.log("Sending module split message ", index)

      if (index === 0) {
        console.log("Sending initial message immediately")
        await WA.sendText(module_split[index], number)
      } else {
        if (module_split[index].includes("Image")) {
          console.log("Handling Image message")

          // Extracting image index from the message
          const image_index = module_split[index].split(" ")
          const imageIndex = Number(image_index[1])

          console.log("Image Index: ", imageIndex)

          // Delay before sending the media file
          await awaitTimeout(2000)

          // Assuming sendContent.sendMediaFile_v2 is an asynchronous function that sends media files
          await sendContent.sendMediaFile_v2(imageIndex, day, module_No, number)
        } else {
          // Regular text message with a longer delay
          console.log("Sending regular text message")

          await awaitTimeout(10000)
          await WA.sendText(module_split[index], number)
        }
      }
    } catch (error) {
      console.error("Error sending text:", error)
    }
  }
}

//Find Module No in students table and send it
async function sendModuleContent(number) {
  console.log("Entered sendModuleContent")

  // const records_Student = await baseId('Test').select({
  //     filterByFormula: "({Phone} =" + number + ")",
  //     view: "Grid view",
  // }).all();

  // records_Student.forEach(async function (record) {

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${student_table}?filterByFormula=Phone%3D${number}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  )
  console.log("Response ", response)

  if (!response.ok) {
    return "Failed to fetch records from Airtable"
  }

  const data = await response.json()
  const records = data.records

  console.log(records)
  // Process each record
  for (const record of records) {
    console.log("Processing student record")

    const id = await us.getID(number).catch((e) => console.log(e))
    const cDay = record.fields["Next Day"]
    const next_module = record.fields["Next Module"]
    const completed_module = record.fields["Module Completed"]

    if (next_module !== undefined) {
      if (cDay === 5) {
        console.log("Executing outro for day 5")
        // await outro.outro_flow(cDay, number); // Uncomment to execute outro flow
      } else if (next_module === 0) {
        console.log("Next module is 0, finding day content")
        findDay(cDay, number)
      } else {
        if (completed_module === 0 && next_module === 1) {
          console.log(`Starting Day ${cDay} of ${number}`)
          await sendStartDayTopic(next_module, cDay, number)
        } else {
          console.log(`Finding module ${next_module} for day ${cDay}`)
          findModule(cDay, next_module, number)
        }
      }
    } else {
      console.log("Next module is undefined")
    }
  }
}

async function sendStartDayTopic(next_module, cDay, number) {
  // let course_tn = await us.findTable(number);
  // let id = await us.getID(number).catch(e => console.log(e));

  // const records = await baseId(course_tn).select({
  //     filterByFormula: "({Day} =" + cDay + ")",
  //     view: "Grid view",
  // }).all();

  // records.forEach(async function (record) {
  var course_tn = await us.findTable(number)
  // console.log("findModule ", module_No, currentDay)

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${course_tn}?filterByFormula=Day%3D${cDay}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    return "Failed to fetch records from Airtable"
  }

  const data = await response.json()
  const records = data.records

  // console.log(records)
  // Process each record
  for (const record of records) {
    const day_topic = record.fields["Day Topic"]
    // console.log("Day Topic:", day_topic);
    const id = await us.getID(number)

    if (day_topic !== undefined) {
      // let day_topic_split = day_topic.split("--");
      // let hTxt = day_topic_split[0].trim();
      // let bTxt = day_topic_split[1].trim();

      // console.log("Header Text:", hTxt);
      // console.log("Body Text:", bTxt);

      await WA.sendInteractiveButtonsMessage(" ", day_topic, "Let's Begin", number)
        .then(async () => {
          console.log("Message sent successfully")
          console.log("ID ", id)
          await us.updateField(id, "Last_Msg", day_topic)
        })
        .catch((e) => {
          console.log("Error sending interactive message:", e)
        })
    } else {
      console.log("Day topic is undefined. Proceeding to find module.")
      await findModule(cDay, next_module, number)
        .then(() => {
          console.log("findModule called successfully")
        })
        .catch((e) => {
          console.log("Error in findModule:", e)
        })
    }
  }
}

async function markModuleComplete(number) {
  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${student_table}?filterByFormula=Phone%3D${number}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    return "Failed to fetch records from Airtable"
  }

  const data = await response.json()
  const records = data.records

  // console.log(records)
  // Process each record
  for (const record of records) {
    var id = record.id
    var current_module = Number(record.fields["Next Module"])
    var cDay = Number(record.fields["Next Day"])
    var next_module = current_module + 1

    console.log("Entered markModuleComplete: Next Module - ", next_module, " Current Module - ", current_module)

    if (next_module >= 6) {
      console.log("Module series completed. Updating fields.")

      // Update fields for module completion
      await us.updateField(id, "Module Completed", current_module)
      await us.updateField(id, "Next Module", 0)

      // Proceed to find the next day's content
      findDay(cDay, number)
    } else {
      console.log("Module in progress. Updating fields and finding next module.")

      // Update fields for current module completion and next module
      await us.updateField(id, "Module Completed", current_module)
      await us.updateField(id, "Next Module", next_module)

      // Proceed to find the next module's content
      findModule(cDay, next_module, number)
    }
  }
}

async function markModuleComplete_v2(c_m, number) {
  // const records_Student = await baseId('Test').select({
  //     filterByFormula: "({Phone} =" + number + ")",
  //     view: "Grid view",
  // }).all();

  // records_Student.forEach(async function (record) {
  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${student_table}?filterByFormula=Phone%3D${number}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    return "Failed to fetch records from Airtable"
  }

  const data = await response.json()
  const records = data.records

  // console.log(records)
  // Process each record
  for (const record of records) {
    var id = record.id
    var current_module = c_m
    var cDay = Number(record.fields["Next Day"])
    var next_module = current_module + 1

    console.log("Entered markModuleComplete v2: Next Module - ", next_module, " Current Module - ", current_module)

    if (next_module >= 7) {
      console.log("Module series completed. Updating fields.")

      // Update fields for module completion
      await us.updateField(id, "Module Completed", current_module)

      // if (c_m === 6) {
      await us.updateField(id, "Next Module", 0)
      findDay(cDay, number)
      // }
    } else {
      console.log("Module in progress. Updating fields and finding next module.")

      // Update fields for current module completion and next module
      await us.updateField(id, "Next Module", next_module)
      await us.updateField(id, "Module Completed", current_module)

      // Proceed to find the next module's content
      findModule(cDay, next_module, number)
    }
=======
const { createClient } = require("@supabase/supabase-js")
const wati = require("./wati")
const { processUserResponse } = require("./server")

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to get user by phone number
async function getUserByPhone(phoneNumber) {
  const { data, error } = await supabase.from("users").select("*").eq("phone_number", phoneNumber).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

// Helper function to get user progress
async function getUserProgress(userId) {
  const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching user progress:", error)
    return null
  }

  return data
}

// Helper function to get course by ID
async function getCourse(courseId) {
  const { data, error } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (error) {
    console.error("Error fetching course:", error)
    return null
  }

  return data
}

// Helper function to get day by ID
async function getDay(dayId) {
  const { data, error } = await supabase.from("days").select("*").eq("id", dayId).single()

  if (error) {
    console.error("Error fetching day:", error)
    return null
  }

  return data
}

// Helper function to get module by ID
async function getModule(moduleId) {
  const { data, error } = await supabase.from("modules").select("*, media(*)").eq("id", moduleId).single()

  if (error) {
    console.error("Error fetching module:", error)
    return null
  }

  return data
}

// Helper function to get modules for a day
async function getModulesForDay(dayId) {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("day_id", dayId)
    .order("sequence_number", { ascending: true })

  if (error) {
    console.error("Error fetching modules:", error)
    return []
  }

  return data
}

// Helper function to get media for a module
async function getMediaForModule(moduleId) {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("module_id", moduleId)
    .order("sequence_number", { ascending: true })

  if (error) {
    console.error("Error fetching media:", error)
    return []
  }

  return data
}

// Helper function to update user progress
async function updateUserProgress(userId, updates) {
  const { data, error } = await supabase.from("user_progress").update(updates).eq("user_id", userId).select()

  if (error) {
    console.error("Error updating user progress:", error)
    return null
  }

  return data
}

// Helper function to create user response
async function createUserResponse(responseData) {
  const { data, error } = await supabase.from("user_responses").insert(responseData).select()

  if (error) {
    console.error("Error creating user response:", error)
    return null
  }

  return data
}

// Helper function to create user activity
async function createUserActivity(activityData) {
  const { data, error } = await supabase.from("user_activities").insert(activityData).select()

  if (error) {
    console.error("Error creating user activity:", error)
    return null
  }

  return data
}

// Function to send module content to user
async function sendModuleContent(phoneNumber) {
  try {
    // Get user by phone number
    const user = await getUserByPhone(phoneNumber)
    if (!user) {
      console.error("User not found for phone number:", phoneNumber)
      return
    }

    // Get user progress
    const progress = await getUserProgress(user.id)
    if (!progress) {
      console.error("User progress not found for user:", user.id)
      return
    }

    // Get current module
    const currentModule = await getModule(progress.current_module_id)
    if (!currentModule) {
      console.error("Module not found:", progress.current_module_id)
      return
    }

    // Get media for the module
    const mediaItems = await getMediaForModule(currentModule.id)

    // Send module content to user
    await wati.sendText(phoneNumber, currentModule.content)

    // Send media items if any
    for (const media of mediaItems) {
      if (media.media_type === "image") {
        await wati.sendImage(phoneNumber, media.url, media.caption || "")
      } else if (media.media_type === "video") {
        await wati.sendVideo(phoneNumber, media.url, media.caption || "")
      } else if (media.media_type === "document") {
        await wati.sendDocument(phoneNumber, media.url, media.caption || "")
      } else if (media.media_type === "audio") {
        await wati.sendAudio(phoneNumber, media.url)
      }
    }

    // Create user activity
    await createUserActivity({
      user_id: user.id,
      activity_type: "module_sent",
      module_id: currentModule.id,
      timestamp: new Date().toISOString(),
    })

    // Update user progress if needed
    if (currentModule.requires_response) {
      await updateUserProgress(user.id, {
        awaiting_response: true,
        last_module_sent_at: new Date().toISOString(),
      })
    } else {
      // Move to next module automatically if no response required
      await moveToNextModule(user.id)
    }

    return currentModule
  } catch (error) {
    console.error("Error sending module content:", error)
    throw error
  }
}

// Function to move user to next module
async function moveToNextModule(userId) {
  try {
    // Get user progress
    const progress = await getUserProgress(userId)
    if (!progress) {
      console.error("User progress not found for user:", userId)
      return
    }

    // Get current module
    const currentModule = await getModule(progress.current_module_id)
    if (!currentModule) {
      console.error("Module not found:", progress.current_module_id)
      return
    }

    // Get current day
    const currentDay = await getDay(currentModule.day_id)
    if (!currentDay) {
      console.error("Day not found:", currentModule.day_id)
      return
    }

    // Get all modules for the current day
    const dayModules = await getModulesForDay(currentDay.id)

    // Find the index of the current module
    const currentIndex = dayModules.findIndex((m) => m.id === currentModule.id)

    // Check if there are more modules in the current day
    if (currentIndex < dayModules.length - 1) {
      // Move to the next module in the same day
      const nextModule = dayModules[currentIndex + 1]
      await updateUserProgress(userId, {
        current_module_id: nextModule.id,
        awaiting_response: false,
        last_module_sent_at: new Date().toISOString(),
      })
      return nextModule
    } else {
      // Get the course
      const course = await getCourse(currentDay.course_id)
      if (!course) {
        console.error("Course not found:", currentDay.course_id)
        return
      }

      // Get all days for the course
      const { data: courseDays, error } = await supabase
        .from("days")
        .select("*")
        .eq("course_id", course.id)
        .order("sequence_number", { ascending: true })

      if (error) {
        console.error("Error fetching course days:", error)
        return
      }

      // Find the index of the current day
      const currentDayIndex = courseDays.findIndex((d) => d.id === currentDay.id)

      // Check if there are more days in the course
      if (currentDayIndex < courseDays.length - 1) {
        // Move to the first module of the next day
        const nextDay = courseDays[currentDayIndex + 1]
        const nextDayModules = await getModulesForDay(nextDay.id)

        if (nextDayModules.length > 0) {
          const firstModule = nextDayModules[0]
          await updateUserProgress(userId, {
            current_module_id: firstModule.id,
            current_day_id: nextDay.id,
            awaiting_response: false,
            last_module_sent_at: new Date().toISOString(),
          })
          return firstModule
        }
      } else {
        // Course completed
        await updateUserProgress(userId, {
          course_completed: true,
          completion_date: new Date().toISOString(),
          awaiting_response: false,
        })
        return null
      }
    }
  } catch (error) {
    console.error("Error moving to next module:", error)
    throw error
  }
}

// Function to handle user response
async function handleUserResponse(phoneNumber, message) {
  try {
    // Get user by phone number
    const user = await getUserByPhone(phoneNumber)
    if (!user) {
      console.error("User not found for phone number:", phoneNumber)
      return
    }

    // Get user progress
    const progress = await getUserProgress(user.id)
    if (!progress) {
      console.error("User progress not found for user:", user.id)
      return
    }

    // Check if awaiting response
    if (!progress.awaiting_response) {
      console.log("Not awaiting response from user:", user.id)
      return
    }

    // Get current module
    const currentModule = await getModule(progress.current_module_id)
    if (!currentModule) {
      console.error("Module not found:", progress.current_module_id)
      return
    }

    // Create user response
    await createUserResponse({
      user_id: user.id,
      module_id: currentModule.id,
      response_text: message,
      timestamp: new Date().toISOString(),
    })

    // Create user activity
    await createUserActivity({
      user_id: user.id,
      activity_type: "response_received",
      module_id: currentModule.id,
      timestamp: new Date().toISOString(),
    })

    // Process the response based on module type
    if (currentModule.module_type === "quiz") {
      // Handle quiz response
      const isCorrect = processQuizResponse(currentModule, message)

      if (isCorrect) {
        await wati.sendText(phoneNumber, "That's correct! 🎉")
      } else {
        await wati.sendText(
          phoneNumber,
          "That's not quite right. The correct answer is: " + currentModule.correct_answer,
        )
      }

      // Move to next module
      await moveToNextModule(user.id)

      // Send next module content
      setTimeout(() => {
        sendModuleContent(phoneNumber)
      }, 2000)
    } else {
      // For other module types, just acknowledge the response
      await wati.sendText(phoneNumber, "Thank you for your response!")

      // Move to next module
      await moveToNextModule(user.id)

      // Send next module content
      setTimeout(() => {
        sendModuleContent(phoneNumber)
      }, 2000)
    }
  } catch (error) {
    console.error("Error handling user response:", error)
    throw error
  }
}

// Helper function to process quiz response
function processQuizResponse(module, response) {
  if (!module.correct_answer) return true

  const normalizedResponse = response.trim().toLowerCase()
  const normalizedAnswer = module.correct_answer.trim().toLowerCase()

  return normalizedResponse === normalizedAnswer
}

// Function to start a course for a user
async function startCourse(phoneNumber, courseId) {
  try {
    // Get user by phone number
    const user = await getUserByPhone(phoneNumber)
    if (!user) {
      console.error("User not found for phone number:", phoneNumber)
      return
    }

    // Get the course
    const course = await getCourse(courseId)
    if (!course) {
      console.error("Course not found:", courseId)
      return
    }

    // Get the first day of the course
    const { data: days, error } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", courseId)
      .order("sequence_number", { ascending: true })
      .limit(1)

    if (error || !days || days.length === 0) {
      console.error("No days found for course:", courseId)
      return
    }

    const firstDay = days[0]

    // Get the first module of the first day
    const firstDayModules = await getModulesForDay(firstDay.id)
    if (firstDayModules.length === 0) {
      console.error("No modules found for day:", firstDay.id)
      return
    }

    const firstModule = firstDayModules[0]

    // Update user progress
    await updateUserProgress(user.id, {
      course_id: courseId,
      current_day_id: firstDay.id,
      current_module_id: firstModule.id,
      start_date: new Date().toISOString(),
      course_completed: false,
      awaiting_response: false,
    })

    // Create user activity
    await createUserActivity({
      user_id: user.id,
      activity_type: "course_started",
      course_id: courseId,
      timestamp: new Date().toISOString(),
    })

    // Send welcome message
    await wati.sendText(phoneNumber, `Welcome to ${course.title}! Let's get started.`)

    // Send first module content
    setTimeout(() => {
      sendModuleContent(phoneNumber)
    }, 2000)

    return { user, course, firstModule }
  } catch (error) {
    console.error("Error starting course:", error)
    throw error
  }
}

// Function to register a new user
async function registerUser(phoneNumber, name) {
  try {
    // Check if user already exists
    const existingUser = await getUserByPhone(phoneNumber)
    if (existingUser) {
      console.log("User already exists:", existingUser)
      return existingUser
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        phone_number: phoneNumber,
        name: name,
        registration_date: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    // Create user progress record
    const { error: progressError } = await supabase.from("user_progress").insert({
      user_id: newUser[0].id,
      awaiting_response: false,
    })

    if (progressError) {
      console.error("Error creating user progress:", progressError)
    }

    // Create user activity
    await createUserActivity({
      user_id: newUser[0].id,
      activity_type: "user_registered",
      timestamp: new Date().toISOString(),
    })

    return newUser[0]
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
>>>>>>> 1970ee7 (Initial commit)
  }
}

module.exports = {
<<<<<<< HEAD
  markDayComplete,
  sendModuleContent,
  markModuleComplete,
  store_responses,
  store_intResponse,
  store_quesResponse,
  sendList,
  findModule,
=======
  sendModuleContent,
  handleUserResponse,
  startCourse,
  registerUser,
  getUserByPhone,
  getUserProgress,
  updateUserProgress,
  createUserResponse,
  createUserActivity,
  getModule,
  getDay,
  getCourse,
>>>>>>> 1970ee7 (Initial commit)
}
