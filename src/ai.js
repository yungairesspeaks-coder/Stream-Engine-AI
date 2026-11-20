const OpenAI=require("openai");
async function generateConcepts({songTitle,genre,brief,count=20}) {
 if(!process.env.OPENAI_API_KEY) return Array.from({length:count},(_,i)=>({concept:"Original short-form visual teaser "+(i+1)+" for "+songTitle,hook:"Stop scrolling — this one is for the nights you had to rebuild.",script:"0–2s: Pattern-breaking opening shot. 2–7s: Show the emotional conflict through cinematic visuals. 7–12s: Reveal the artist/title and direct viewers to the official track.",caption:"New music from Yung Aires. Discover the track through the official artist link.",hashtags:["NewMusic","IndependentArtist","HipHop","YungAires"],videoPrompt:""}));
 const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
 const r=await client.chat.completions.create({model:process.env.OPENAI_TEXT_MODEL||"gpt-4.1-mini",response_format:{type:"json_object"},messages:[
 {role:"system",content:"You are an expert short-form music creative director and performance marketer. Return concise, original, usable ad assets as JSON. Never promise virality or recommend fake streams, bots, artificial looping, spam, or engagement manipulation. Provide an immediate 1-second hook, a concise time-coded promotional script, a compelling caption and relevant non-spammy hashtags. Do not generate images, video, footage or media files."},
 {role:"user",content:JSON.stringify({songTitle,genre,brief,count,output:{concepts:[{concept:"creative angle",hook:"opening hook",script:"time-coded script",caption:"caption with CTA",hashtags:["tag"],videoPrompt:"silent 9:16 visual prompt"}]}})}
 ]});
 return (JSON.parse(r.choices[0].message.content||"{}").concepts||[]).slice(0,count);
}
module.exports={generateConcepts};
