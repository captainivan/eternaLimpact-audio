import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import ImageKit from "imagekit";

export async function POST() {

    const imageKit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });

    try {
        console.log("Audio Generating Started ...");

        const url = await fetch(`https://ik.imagekit.io/ilunarivanthesecond/basicData.json?updatedAt=${Date.now()}`);
        const res = await url.json();

        const elevenLabs = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_APIKEY,
        });

        const audioStream = await elevenLabs.textToSpeech.convert(
            "pNInz6obpgDQGcFmaJgB",
            {
                text: res.script,
                modelId: "eleven_multilingual_v2",
                outputFormat: "mp3_44100_128",
            }
        );

        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        const uploadResponse = await imageKit.upload({
            file: audioBuffer,
            fileName: "audio.mp3",
            fileId: process.env.AUDIO_FILE_ID,
            overwriteFile: true,
            useUniqueFileName: false
        });

        console.log("Audio Generating Completed ...");
        return Response.json({message:"sucees",url:uploadResponse.url});

    } catch (error) {
        console.error("Audio Generation Failed ❌", error.message);
        return Response.json({ success: false, message: error.message });
    }
}