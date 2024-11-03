import { NextRequest, NextResponse } from "next/server";
import {z} from "zod"
import { prismaClient } from "@/app/lib/db";
// @ts-expect-error : : YouTubePlayer may not have TypeScript types or has compatibility issues
import youtubesearchapi from "youtube-search-api"
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";
import { cors } from "@/lib/core";
export const dynamic = 'force-dynamic';

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
})

async function handler(req: NextRequest) {
    // Run the middleware
    await cors(req);

    if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200 });
    }

    if (req.method === 'POST') {
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

            const session = await getServerSession();

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
        
            let thumbnails = [];
            let title = "Can't find video";
            let smallImg = "https://images.minitool.com/moviemaker.minitool.com/images/uploads/articles/2020/08/youtube-video-not-available/youtube-video-not-available-1.png";
            let bigImg = smallImg;
        
            if (res && res.thumbnail && res.thumbnail.thumbnails) {
                thumbnails = res.thumbnail.thumbnails;
                thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? -1 : 1);
                
                title = res.title || title;
                smallImg = (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) || smallImg;
                bigImg = thumbnails[thumbnails.length - 1].url || bigImg;
            }
        
            const stream = await prismaClient.stream.create({
                data: {
                    userId: data.creatorId,
                    url: data.url,
                    extractedId,
                    type: "Youtube",
                    title,
                    smallImg,
                    bigImg,
                    addedById: user.id,
                }
            });
        
            return NextResponse.json({
                ...stream,
                hasUpvoted: false,
                upvotes: 0,       
            });
        } catch (error) {
            console.error("Error while adding a stream:", error);
            return NextResponse.json({
                message: "Error while adding a stream",
                error: error instanceof Error ? error.message : String(error)
            }, {
                status: 500,
            });
        }
    } else if (req.method === 'GET') {
        const creatorId = req.nextUrl.searchParams.get("creatorId");
        const session = await getServerSession();

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
    } else {
        return new NextResponse(null, { status: 405 });
    }
}

export { handler as GET, handler as POST };