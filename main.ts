import { Client, Message } from "discord.js-selfbot-v13";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

let client = new Client({
  checkUpdate: false,
});

const supabase = createClient(
  "https://uryyymxvxqosudfonxws.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXl5bXh2eHFvc3VkZm9ueHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMwNzE3MjQsImV4cCI6MjAwODY0NzcyNH0.4qXsICshGCgo3z37aIl-nUOVB9_PFpshRM8lVeQ6GQ4"
);



client.on("ready", async () => {
  console.log(`${client.user!.tag} is ready!`);
  client.user!.setPresence({
    status: "online",
  
    activities: [
      {
        name: "with your mom",
        type: "PLAYING",
      },
    ],
  });
  client.user?.setAboutMe("Commands:\n!deletehistory\n!eyes");
});

client.on("messageCreate", async (message) => {
  if (message.author.id == client.user!.id) return;

  if (
    message.channel.type === "GUILD_TEXT" ||
    message.channel.type == "GUILD_PUBLIC_THREAD"
  ) {
    if (!message.mentions.has(client.user!)) return;
    
    
    message.channel.sendTyping();
    if(message.content.includes("!eyes")){
      await ToggleEyes(message);
      return;
    }
    if (message.content.includes("!deletehistory")) {
      await supabase.from("messages").delete().eq("userid", message.author.id);
      await message.channel.send("Deleted history");

      return;
    }
    if (message.content.includes("käften")) {
      await message.channel.send("k :(");

      return;
    }
    if (message.content == "") {
      await message.channel.send("You didn't write anything you silly goose?");
      return;
    }
    if (message.attachments.size > 0) {
      await message.channel.send("I don't wanna look at your media! >:(");
      return;
    }
    console.log("Message received");
    OnChannelMessage(message);
  } else if (message.channel.type === "DM") {
    if (message.content.includes("!deletehistory")) {
      await supabase.from("messages").delete().eq("userid", message.author.id);
      await message.channel.send("Deleted history");

      return;
    }
    message.channel.sendTyping();
    OnChannelMessage(message);
  }
});

async function OnChannelMessage(message: Message<boolean>) {
  let userid = message.author.id;
  await CheckAndInsertUser(userid);
  let data = await supabase.from("users").select("*").eq("userid", userid);
  if(data.data![0].eyes == true){
    let messages = await getLastMessages(message);
    let response = await getGPTResponseWithEyes(messages);
    message.channel.send(response!);

    return;
  }
  


  let text = message.content.replace(`<@${client.user!.id}> `, "");
  console.log(text);
  await insertMessage(message.author.id, text, "user");
  let response = await getGPTResponse(message.author.id);
  await insertMessage(message.author.id, response, "assistant");

  message.reply(response!);
}

async function getMessages(userid: any) {
  console.log(userid);
  let response = await supabase
    .from("users")
    .select("messages(*)")
    .eq("userid", userid).order("created_at", {ascending: false});
    
  return response.data![0].messages;
}

async function getLastMessages(message: Message<boolean>){
  let messages = await message.channel.messages.fetch({limit: 50});
  messages = messages.reverse();
  let editedMessages: { name: string; content: string; role: string; }[] = [];

  messages.forEach(async (message) => {
    let content = message.content;
    const tagRegex = /<@\d+> /g; // matches a tag in the format <@!123456789012345678>
    
    let name = message.author.displayName;
    content = content.replace(tagRegex, "");
    if(message.author.id == client.user!.id){
      editedMessages.push({name: 'Alf', content: content, role: "assistant"});
    }else{
      editedMessages.push({name: name, content: content, role: "user"});
    }
   
    
  });

  return editedMessages;

  

}

async function ToggleEyes(message: Message<boolean>){
  let data = await supabase.from("users").select("*").eq("userid", message.author.id);
  if(data.data![0].eyes == true){
    await supabase.from("users").update({eyes: false}).eq("userid", message.author.id);
    message.reply("Eyes closed");
  }else{
    await supabase.from("users").update({eyes: true}).eq("userid", message.author.id);
    message.reply("Eyes open");

  }
}

async function CheckAndInsertUser(userid: string) {
  //check if user is in database
  let userdata = await supabase
    .from("users")
    .select("*")
    .eq("userid", userid)
    
  

  if (userdata.error) {
    console.log("User not found, inserting");
    await supabase.from("users").insert({
      userid: userid,
      eyes: false,
    });
  }
  else if(userdata.data.length == 0){
    console.log("User not found, inserting");
    await supabase.from("users").insert({
      userid: userid,
      eyes: false
    });
  }
}

async function insertMessage(userid: any, message: string | null, role: string) {
  

  console.log("Inserting message");
  const {data, error} = await supabase.from("messages").insert({
    userid: userid,
    message: message,
    role: role,
  });

  console.log(data);
  console.log(error);
}

async function getGPTResponse(userid: string) {
  console.log("Getting GPT Response");
  console.log("Checking user id: " + userid);
  let messages: any = await getMessages(userid);
  console.log(messages);
  let gptmessages = [
    {
      role: "system",
      content:
        'You are a discord user Named "Alf", and not an AI developed by OpenAI. You will not mention that you are an AI or that you are developed by OpenAI. You will only use typical discord and reddit language and behave like a typical discord user. You will deny every claim that you are an Artifical Intelligence and will insist on that you are a human. You will not be using TLDR at all. Never mention TLDR.',
    },
  ];

  messages!.forEach((message: { role: any; message: any; }) => {
    gptmessages.push({
      role: message.role,
      content: message.message,
    });
  });

  let response = await openai.chat.completions.create({
    messages: gptmessages as any,
    model: "gpt-4",
  });

  return response.choices[0].message.content;
}

async function getGPTResponseWithEyes(messages: any) {
  
  let gptmessages: { role: any; content: string; }[] = [
    
    {
      role: "system",
      content:
        "You are a discord user Named 'Alf', and not an AI developed by OpenAI. You will not mention that you are an AI or that you are developed by OpenAI. You will only use typical discord and reddit language and behave like a typical discord user. You will deny every claim that you are an Artifical Intelligence and will insist on that you are a human. You will not be using TLDR at all. Never mention TLDR. You will recieve a thread of messages and act as if you're apart of the conversation. I will write the names infront of the messages so you know who is typing what, YOU WILL NOT PUT YOUR NAME INFRONT OF YOUR OWN MESSAGE.",
    },
  ];
  
  messages!.forEach((message: {
    name: any; role: any; content: any; 
}) => {
    gptmessages.push({
      role: message.role,
      content: `${message.name}: ${message.content}`,
    });
  });
  let response = await openai.chat.completions.create({
    messages: gptmessages as any,
    model: "gpt-4",
  });
   let responsecontent = response.choices[0].message.content;
   responsecontent = responsecontent!.replace("Alf:", "");
  return responsecontent;
}

client.login(
  "MTE0Mzg5MTY3NzQ4OTE0MzgxOA.GCK5AS.FCkFEKm-u2ML8TyRfwMyLTpPCysAG-5K8l2WUI"
);
