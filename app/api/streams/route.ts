import { NextRequest, NextResponse } from "next/server";
import {z} from "zod"
import { prismaClient } from "@/app/lib/db";
//@ts-ignore
import youtubesearchapi from "youtube-search-api"
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
})

export async function POST(req:NextRequest){
    try {
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX)
        if(!isYt){
            return NextResponse.json({
                message: "Wrong URL format"
            },{
                status: 411,
            })
        }

        const session = await getServerSession(); // fetch user details on backend
        // TODO : Can get rid of db call

        const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? "",
        }
        })
     
        if(!user){
            return NextResponse.json({
            message: "Unauthenticated"
        },{
            status: 403,
        })
        }


        const extractedId = data.url.split("?v=")[1];
        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? -1 : 1);

        const existingActiveStream = await prismaClient.stream.findFirst({
            where: {
                addedById: user.id,
            }
        })

        if(existingActiveStream && existingActiveStream?.userId !== user.id){
            return NextResponse.json({
                message: "Already playing a stream"
            },{
                status: 403,
            })
        }

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
                title: res.title ?? "Can't find video",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "https://images.minitool.com/moviemaker.minitool.com/images/uploads/articles/2020/08/youtube-video-not-available/youtube-video-not-available-1.png",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "https://images.minitool.com/moviemaker.minitool.com/images/uploads/articles/2020/08/youtube-video-not-available/youtube-video-not-available-1.png",
                addedById: user.id,
            }
        })

        return NextResponse.json({
            ...stream,
            hasUpvoted: false,
            upvotes: 0,       
        })
    }catch(e){
        return NextResponse.json({
            message: "Error while adding a stream"
        },{
            status: 411,
        })
    }
}


// fetch current stream
export async function GET(req: NextRequest) {
    
    const creatorId = req.nextUrl.searchParams.get("creatorId"); // get creatorId from query params
    const session = await getServerSession(); // fetch user details on backend
    // TODO : Can get rid of db call

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? "",
        }
    })
     
    if(!user){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status: 403,
        })
    }

    if(!creatorId){
        return NextResponse.json({
            message: "Error"
        },{
            status: 411,
        })
    }

    const [streams, activeSteam] = await Promise.all([prismaClient.stream.findMany({
        where: {
            userId: creatorId,
            played: false,
        },
        include: {
            _count: {
                select: {
                    upvotes: true,
                }
            },
            upvotes: {
                where: {
                    userId: user.id,
                }
            }
        }
    }), prismaClient.currentStream.findFirst({
        where: {
            userId: creatorId,
        },
        include: {
            stream: true
        }
    })])    

    return NextResponse.json({
        streams: streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false,
        })),
        activeSteam
    })
}

