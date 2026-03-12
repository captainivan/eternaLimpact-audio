import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import ImageKit from "imagekit";

export async function POST() {

    let succeededKey = null;

    // ✅ Fixed — process.env outside the string
    const ELEVEN_LABS_API_KEYS = [
        process.env.ELEVENLABS_APIKEY_1,
        process.env.ELEVENLABS_APIKEY_2,
        process.env.ELEVENLABS_APIKEY_3,
        process.env.ELEVENLABS_APIKEY_4,
        process.env.ELEVENLABS_APIKEY_5,
        process.env.ELEVENLABS_APIKEY_6,
        process.env.ELEVENLABS_APIKEY_7
    ];

    const imageKit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });

    try {
        console.log("Audio Generating Started ...");

        const url = await fetch(`https://ik.imagekit.io/ilunarivanthesecond/basicData.json?updatedAt=${Date.now()}`);
        const res = await url.json();

        // ✅ Try each API key until one succeeds
        let audioBuffer = null;

        for (let i = 0; i < ELEVEN_LABS_API_KEYS.length; i++) {
            try {
                console.log(`Trying ElevenLabs API key ${i + 1}...`);

                const elevenLabs = new ElevenLabsClient({
                    apiKey: ELEVEN_LABS_API_KEYS[i],
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
                audioBuffer = Buffer.concat(chunks);

                console.log(`API key ${i + 1} succeeded ✅`);
                succeededKey = i + 1;
                break; // ✅ Stop trying once one succeeds

            } catch (error) {
                console.log(error);

                console.log(`API key ${i + 1} failed ❌ trying API key ${i + 2}...`);

                // If all keys exhausted, throw error
                if (i === ELEVEN_LABS_API_KEYS.length - 1) {
                    throw new Error("All ElevenLabs API keys failed");
                }
            }
        }

        const uploadResponse = await imageKit.upload({
            file: audioBuffer,
            fileName: "audio.mp3",
            overwriteFile: true,
            useUniqueFileName: false,
            fileId: process.env.AUDIO_FILE_ID
        });

        console.log("Audio Generating Completed ...");
        return Response.json({ success:true, url:uploadResponse.url, key:succeededKey, totalKeys:ELEVEN_LABS_API_KEYS.length });

    } catch (error) {
        console.error("Audio Generation Failed ❌", error.message);
        return Response.json({ success: false, message: error.message });
    }
}