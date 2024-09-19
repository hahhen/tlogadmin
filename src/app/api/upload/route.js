import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET({ request }) {
    return Response.json({ message: "Hello World" }, { status: 200 });
}

export async function POST(request) {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const req = await request.formData()

    const newalbum = req.get("newalbum")
    const existingalbum = req.get("existingalbum[id]")
    var tracks = []
    for (var i = 0; i <= (Array.from(req.keys()).length - 2) / 3 - 1; i++) {
        await tracks.push({
            title: req.get(`tracks[${i}][title]`),
            track_number: req.get(`tracks[${i}][track_number]`),
            file: req.get(`tracks[${i}][file]`)
        })
    }

    function slugify(name, separator = "-") {
        return name
            .toString()
            .normalize('NFD')                   // split an accented letter in the base letter and the acent
            .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')   // remove all chars not letters, numbers and spaces (to be replaced)
            .trim()
            .replace(/\s+/g, separator);
    };


    // if (newalbum != null) {
    //     try {
    //         await Promise.all(async () => {
    //             const slug = slugify(newalbum.title);
    //             const cover = (await (await supabase).storage.from("tlog").upload(`${slug}/`, newalbum.cover)).data
    //             const coverurl = (await supabase).storage.from("tlog").getPublicUrl(cover.fullPath).data.publicUrl
    //             const { data: album, error } = await supabase.from("album").insert({ title: newalbum.title, slug: slug, cover: coverurl }).select()

    //             if (error) {
    //                 return Response.json({ error: error.message }, { status: 400 });
    //             }

    //             tracks.map(async (track) => {
    //                 const uploadedTrack = (await (await supabase).storage.from("tlog").upload(`${slug}/`, track.file)).data
    //                 const trackurl = (await supabase).storage.from("tlog").getPublicUrl(uploadedTrack.fullPath).data.publicUrl

    //                 const { data: uploadedtrack, error } = await supabase.from("track").insert({ title: track.title, album: album.id, track_number: track.track_number, url: trackurl }).select()
    //                 if (error) {
    //                     return Response.json({ error: error.message }, { status: 400 });
    //                 }
    //             })

    //         })
    //     }
    //     catch (error) {
    //         return Response.json({ error: error.message }, { status: 400 });
    //     }
    // }

    if (existingalbum != null) {
        try {
            const { data: album, error } = await supabase.from("album").select().eq("id", existingalbum).single()
            if (error) {
                return Response.json({ error: error.message }, { status: 400 });
            }
            
            Promise.all(tracks.map(async (track) => {
                    const trackArrayBuffer = await track.file.arrayBuffer()
                    const {data: uploadedTrack, error: error2} = await supabase.storage.from("tlog").upload(`${album.slug}/${track.file.name}`, trackArrayBuffer, {upsert: false, contentType: track.file.type})
                    if (error2) {
                        return Response.json({ error: error2.message }, { status: 400 });
                    }

                    const {data: trackurl} = await supabase.storage.from("tlog").getPublicUrl(uploadedTrack.path)

                    const { data: insertedTrack, error: error3 } = await supabase.from("song").insert({ title: track.title, albumid: album.id, track_number: track.track_number, url: trackurl.publicUrl }).select()
                    if (error3) {
                        return Response.json({ error: error3.message }, { status: 400 });
                    }
            }))
        }
        catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    }

    return Response.json({ message: "Uploaded" }, { status: 200 });
}