"use client"

import StreamView from '../components/StreamView'

import useRedirect from '@/app/hooks/useRedirect';
import { useSession } from 'next-auth/react'



export default function Component() {
  const session = useSession();
    useRedirect();
  try {
      if (!session.data?.user.id) {
          return (
              <h1>Please Log in....</h1>
          )
      }
      return <StreamView creatorId={session.data.user.id} playVideo={true} />
  } catch {
      return null
  }
}
export const dynamic = 'auto'