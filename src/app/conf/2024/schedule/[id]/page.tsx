import { notFound } from "next/navigation"
import { Metadata } from "next"
import clsx from "clsx"
import { Avatar } from "../../../_components/speakers/avatar"
import { BackLink } from "../../../_components/schedule/back-link"
import {
  SocialMediaIcon,
  SocialMediaIconServiceType,
} from "../../../_components/speakers/social-media"
import { speakers, schedule } from "@/app/conf/2024/_data"
import { metadata as layoutMetadata } from "@/app/conf/2023/layout"
import { ScheduleSession } from "../../../2023/types"
import { format, parseISO } from "date-fns"

function getEventTitle(event: ScheduleSession, speakers: string[]): string {
  let { name } = event

  if (!speakers) {
    return name
  }

  speakers?.forEach(speaker => {
    const speakerInTitle = name.indexOf(`- ${speaker.replace("ı", "i")}`)
    if (speakerInTitle > -1) {
      name = name.slice(0, speakerInTitle)
    }
  })

  return name
}

type SessionProps = { params: { id: string } }

export function generateMetadata({ params }: SessionProps): Metadata {
  const event = schedule.find(s => s.id === params.id)!

  const keywords = [
    event.event_type,
    event.audience,
    event.event_subtype,
    ...(event.speakers || []).map(s => s.name),
  ].filter(Boolean)

  return {
    title: event.name,
    description: event.description,
    keywords: [...layoutMetadata.keywords, ...keywords],
    openGraph: {
      images: `/img/__og-image/2024/${event.id}.png`,
    },
  }
}

export function generateStaticParams() {
  return schedule.filter(s => s.id).map(s => ({ id: s.id }))
}

const Tag = ({
  text,
  featured = false,
}: {
  text: string
  featured?: boolean
}) =>
  !text ? null : (
    <span
      className={clsx(
        "border border-solid border-[#333333] font-semibold text-sm px-3 py-1 h-max rounded-full whitespace-nowrap",
        featured ? "bg-[#F8779D] border-[#F8779D] border-2 text-white" : "",
      )}
    >
      {text}
    </span>
  )

export default function SessionPage({ params }: SessionProps) {
  const event = schedule.find(s => s.id === params.id)
  if (!event) {
    notFound()
  }
  // @ts-expect-error -- fixme
  event.speakers = (event.speakers || []).map(speaker =>
    speakers.find(s => s.username === speaker.username),
  )

  const eventType = event.event_type.endsWith("s")
    ? event.event_type.slice(0, -1)
    : event.event_type

  const eventTitle = getEventTitle(
    event,
    event.speakers!.map(s => s.name),
  )

  return (
    <div className="bg-[#f4f6f8]">
      <div className="container">
        <div className="py-10">
          <section className="text-[#333333] min-h-[80vh] flex-col mx-auto px-2 xs:px-0 lg:justify-between justify-center md:container">
            <div className="flex flex-col lg:px-0">
              <BackLink year="2024" kind="schedule" />

              <div className="mt-10 flex flex-col self-center prose lg:prose-lg sm:space-y-4">
                <div className="space-y-5">
                  <div className="flex gap-3 flex-wrap">
                    <Tag text={eventType} featured />
                    <Tag text={event.audience} />
                    <Tag text={event.event_subtype} />
                  </div>
                  <h1 className="mt-0 text-2xl lg:text-3xl font-medium">
                    {eventTitle}
                  </h1>
                  <span className="text-[#333333]">
                    {format(
                      parseISO(event.event_start),
                      "EEEE, MMMM d / hh:mmaaaa 'PDT'",
                    )}{" "}
                    - {format(parseISO(event.event_end), "hh:mmaaaa 'PDT'")}
                  </span>
                </div>
                <div className="flex lg:flex-row flex-col sm:gap-5">
                  {event.speakers!.map(speaker => (
                    <div
                      className="flex items-center gap-3"
                      key={speaker.username}
                    >
                      <Avatar
                        className="lg:size-[120px] size-[100px] rounded-full"
                        avatar={speaker.avatar}
                        name={speaker.name}
                      />

                      <div className="flex flex-col lg:gap-1 gap-1.5">
                        <a
                          href={`/conf/2024/speakers/${speaker.username}`}
                          className="text-xl mt-0 font-bold text-[#333333] underline"
                        >
                          {speaker.name}
                        </a>

                        <span className="font-normal">
                          <span className="font-semibold">
                            {speaker.company}
                          </span>
                          {speaker.company && ", "}
                          {speaker.position}
                        </span>
                        {speaker.socialurls?.length ? (
                          <div className="mt-0 text-[#333333]">
                            <div className="flex space-x-2">
                              {speaker.socialurls.map(social => (
                                <a
                                  key={social.url}
                                  href={social.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center text-black"
                                >
                                  <SocialMediaIcon
                                    service={
                                      social.service.toLowerCase() as SocialMediaIconServiceType
                                    }
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <p>{event.description}</p>

                <div className="py-8">
                  {event.files?.map(({ path }) => (
                    <div key={path}>
                      <a href={path} target="_blank" rel="noreferrer">
                        View Full PDF{" "}
                        <span className="font-sans font-light text-2xl">
                          ↗
                        </span>
                      </a>
                      <iframe src={path} className="aspect-video size-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
