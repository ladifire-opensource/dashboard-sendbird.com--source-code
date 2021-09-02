import { Link, LinkVariant } from 'feather';

import { WhatsNewCategory } from '../types';

export const LegacyJSXContents = [
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'Peer-to-peer calling, webhooks, and on-device recording for Sendbird Calls',
    text: (
      <>
        <p>
          The Sendbird Calls API now includes some new features! We’ve added <strong>webhooks</strong> for developers,
          so that you can program responses in external applications for call related events, e.g. custom signals from a
          connected speaker or an automated call log. New <strong>peer-to-peer device connections</strong>, which
          deliver a cost-efficient and quality-optimized alternative to calls routed through a server (server-relayed),
          and <strong>on-device multimedia recording</strong> that empowers providers and users with a private, secure,
          and convenient way to store call information.
        </p>
        <p>
          To learn more about the Sendbird Calls self-service option, and it’s new capabilities you can read this{' '}
          <Link
            variant={LinkVariant.Inline}
            href="https://sendbird.com/blog/sendbird-calls-now-includes-self-service-p2p-calls-webhooks-and-local-recording"
            target="_blank"
          >
            blog
          </Link>{' '}
          and view our{' '}
          <Link variant={LinkVariant.Inline} href="https://sendbird.com/docs" target="_blank">
            docs
          </Link>
        </p>
      </>
    ),
    date: '2020-09-30',
  },
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'Announcing Supergroups for Sendbird Chat',
    text: (
      <>
        <p>
          Today, we're very excited to announce the launch of Supergroups for Sendbird Chat. Supergroups is a new kind
          of group channel in Sendbird Chat - to power private group chat for upto 20,000 users in a single group.
        </p>
        <p>
          Supergroups support standard group chat features such as sending and receiving messages between users, sharing
          media and file messages, online presence indicators, displaying the last message, message unread count for
          upto 100 unread messages, operators, showing the member list, channel mentions, and mention counts.
          Supergroups also supports channel management and moderation features that customers have come to rely on and
          love.
        </p>
        <p>
          We know that Push notifications is a big part of your chat engagement strategy, so we've re-imagined this to
          work at Supergroups scale. For groups with sizes 100 members or less, Supergroups simply sends a push
          notification for every message sent. For groups with sizes greater than 100 members, customers can choose to
          send push notifications using two options - 1. Send a push notification in every 10 minutes window, 2. Choose
          a new kind of push notification - Smart Push. Smart Push sends a notification to the supergroup for every
          message sent by users that were active in the previous 60 seconds. With push notifications handled,
          Supergroups power large scale conversations without compromising engagement.
        </p>
        <p>
          Supergroups is available in Sendbird Chat API and SDKs for iOS, Android and Javascript; and is also available
          in the Sendbird UIKit.
        </p>
        <p>Give it a try today and build large scale connections in your communities!</p>
      </>
    ),
    date: '2020-09-28',
  },
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'Announcing Advanced Analytics for Sendbird Chat',
    text: (
      <>
        <p>
          We're excited to announce the launch of Advanced Analytics for Sendbird Chat. Advanced Analytics is an
          analytics feature that provides better insight into users, messages, and channels, which can help you analyze
          and understand user behavior in the Sendbird Chat application. Advanced analytics offers immediate access to
          metrics aggregated from your application, enabling relevant and pragmatic insights. You can use Advanced
          Analytics to monitor metrics both via the Chat Platform API and the Sendbird Dashboard.
        </p>
        <p>
          Advanced Analytics lets you track user behavior across nine metrics, these are: messages, messages per user,
          new channels, active channels, message senders, message viewers, new users, deactivated users, and deleted
          users. These metrics can facilitate better-informed decision making, and improve your client app's user
          experience.
        </p>
        <p>Give it a try and tell us what you think!</p>
      </>
    ),
    date: '2020-09-28',
  },
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'Sendbird Chat Announcements',
    text: (
      <>
        <p>
          We’re excited to announce the launch of Announcements for Sendbird Chat - a new engagement channel in the
          Sendbird Chat platform. With Announcements, modern brands and marketers can reach customers by sending
          relevant and memorable messages to their existing chat streams and forge real human connections with their
          customers.
        </p>
        <p>
          Announcements enable you to engage with your customers directly within chat in your app. Whether you’re a
          marketplace aiming to drive higher conversions, an on-demand business trying to grow adoption of a new
          service, a healthcare business trying to proactively engage patients, or an online community trying to nudge
          user participation — engaging customers in the moments that matter to your business is the foundation for
          business success.
        </p>
        <p>
          To start using Sendbird Chat Announcements, visit the{' '}
          <Link
            variant={LinkVariant.Inline}
            href="https://sendbird.com/docs/chat/v3/platform-api/guides/announcements"
            target="_blank"
          >
            docs
          </Link>
          .
        </p>
      </>
    ),
    date: '2020-08-27',
  },
  {
    category: WhatsNewCategory.Updates,
    title: 'Sendbird Service Status Page',
    text: (
      <>
        <p>
          We intend to bring greater transparency and accountability in delivering reliable communication services to
          you. We're pleased to announce the release of Sendbird's Service Status Page.
        </p>
        <p>
          Sendbird's Service Status Page is a web page that lets customers know about the status of Sendbird Chat
          services. Every server region has a unique service status page that can be accessed by navigating to the
          ‘Overview’ section of the Sendbird dashboard, and then clicking on the ‘View status’ link beside ‘Server’ in
          the ‘Application’ section.
        </p>
        <p>
          With the releases of Service Status Page - customers can directly learn about uptime, any partial degradation,
          or any downtime in Sendbird Chat services. We will also communicate about our approaches to handling incidents
          from this page in case of any incidents.
        </p>
        <p>
          We hope this improves your overall Sendbird experience. As always, please let us know if you have any
          questions or feedback - we’d love to hear from you.
        </p>
      </>
    ),
    date: '2020-08-03',
  },
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'Delivery Receipts',
    text: (
      <>
        <p>We're happy to announce the launch of Delivery Receipts.</p>
        <p>
          Delivery Receipts tell a sender that their message has been delivered successfully to a recipient, but not
          whether the recipient has seen or read it. The sender does not have to second guess whether their message was
          delivered or not, and can then move on to other conversations, or set up notifications or events based on the
          message delivery confirmation. Delivery receipts can improve user experiences and engagement within the
          application.
        </p>
        <p>Delivery Receipts are available in both the Sendbird Chat API and SDK, and in the Sendbird UIKit.</p>
      </>
    ),
    date: '2020-06-29',
  },
  {
    category: WhatsNewCategory.Updates,
    title: 'Chat in private channels from dashboard',
    text: (
      <>
        <p>
          We're happy to introduce an update to our moderation tools that lets you create group chats and chat in your
          application right from the dashboard. This functionality was earlier available for open channels for managing
          large public chat use cases. You asked us to bring this to private group channels, so here it is. Now, as a
          dashboard user of private groups you can:
        </p>
        <ul>
          <li>Create a new group channel right from the dashboard.</li>
          <li>Invite users and begin chatting with them, just like you would in the chat application</li>
          <li>Change channel titles, set your own custom identity and more.</li>
        </ul>
        <p>Give it a spin and check it out in action!</p>
        <p>
          This improvement is available in Moderation Tools under Pro and Enterprise plans. If you have any questions,
          please contact your sales representative or fill out{' '}
          <Link href="/settings/contact_us?category=sales_inquiry" useReactRouter={true}>
            this form
          </Link>{' '}
          to learn more.
        </p>
      </>
    ),
    date: '2020-05-27',
  },
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'UIKit',
    text: (
      <>
        We're very excited to announce the launch of our new <strong>Chat UIKit for iOS, Android, and React.</strong>{' '}
        <br />
        <br />
        You can now use a set of rich, prebuilt UI components, to create a modern messenger experience in your app in
        just <strong>under 10 minutes.</strong>
        <br />
        <br />
        The UIKit comes in{' '}
        <Link variant={LinkVariant.Inline} href="https://sendbird.com/docs/uikit/v1/ios/guides/themes" target="_blank">
          two
        </Link>{' '}
        <Link
          variant={LinkVariant.Inline}
          href="https://sendbird.com/docs/uikit/v1/android/guides/themes"
          target="_blank"
        >
          beautiful
        </Link>{' '}
        <Link
          variant={LinkVariant.Inline}
          href="https://sendbird.com/docs/uikit/v1/javascript/guides/themes"
          target="_blank"
        >
          themes
        </Link>{' '}
        - a <strong>light</strong> theme and a <strong>dark</strong> theme, and can be fully customized to create an
        experience that is unique to your brand.
        <br />
        <br />
        Discover the possibilities of the UIKit by checking out this{' '}
        <Link variant={LinkVariant.Inline} href="https://sample.sendbird.com/uikit-composed/" target="_blank">
          demo
        </Link>{' '}
        - every aspect of this demo was built using the UIKit.
        <br />
        <br />
        Can't wait to get started?
        <br />
        <br />
        Find UIKit documentation for your preferred platform in the following links -{' '}
        <Link
          variant={LinkVariant.Inline}
          href="https://sendbird.com/docs/uikit/v1/ios/getting-started/about-uikit"
          target="_blank"
        >
          iOS
        </Link>
        ,{' '}
        <Link
          variant={LinkVariant.Inline}
          href="https://sendbird.com/docs/uikit/v1/android/getting-started/about-uikit"
          target="_blank"
        >
          Android
        </Link>
        ,{' '}
        <Link
          variant={LinkVariant.Inline}
          href="https://sendbird.com/docs/uikit/v1/javascript/getting-started/about-uikit"
          target="_blank"
        >
          React
        </Link>
        .<br />
        <br />
        All our documentation comes with a beautiful sample app that you can download from GitHub to experience the
        complete potential of UIKit on your preferred platform.
        <br />
        <br />
        Happy building chat! We can't wait to see what you will build.
      </>
    ),
    date: '2020-04-01',
  },
  {
    category: WhatsNewCategory.Updates,
    title: 'Self-service on-boarding flow',
    text: (
      <>
        We're also excited to announce the launch of a new self-service product on-boarding flow for Sendbird Chat.
        <br />
        <br />
        With self-service, you can directly subscribe to the Sendbird Chat service without having to contact our sales
        team.
        <br />
        <br />
        Our self-service plan offers you a 30-day free trial of our most popular features, at the end of which you will
        have the option of choosing between two plans - a <strong>Starter</strong> Plan and a <strong>Pro</strong> Plan.
        <br />
        <br />
        The <strong>Starter</strong> Plan helps small businesses looking for essential chat features and basic
        moderation capabilities to get chat up and running quickly.
        <br />
        <br />
        The <strong>Pro</strong> Plan is suitable for growing businesses, it has everything from the starter plan and
        comes with advanced messaging features, advanced moderation and analytics capabilities.
        <br />
        <br />
        Our team has worked very hard to create a smooth and frictionless on-boarding experience for you to start
        building chat in your app.
        <br />
        <br />
        We hope you like it! And like always, please keep sending us your feedback!
      </>
    ),
    date: '2020-04-01',
  },
  {
    category: WhatsNewCategory.Updates,
    title: 'Select data center region for your app',
    text: (
      <>
        <p>
          You requested, we heard. <br />
          <br />
          We're excited to announce that developers can now select their preferred data center region when choosing to
          deploy Sendbird chat in their application. <br />
          You no longer have to worry about data governance and regulations in a location that you're not comfortable
          with. <br />
          With this update, you have the flexibility to choose the region that is closest to your end users and power
          high performant, low latency chat. <br />
          <br />
          Current regions available are: Frankfurt, North Virginia, Oregon, Seoul, Singapore, and Tokyo.
        </p>
      </>
    ),
    date: '2020-02-02',
  },
  {
    category: WhatsNewCategory.Updates,
    title: 'Overview in our dashboard gets a new look',
    text: (
      <>
        <p>
          The new <strong>Overview</strong> is rolling out to provide better visibility of application information and
          product status. One of the major changes is placing <strong>Application</strong> and{' '}
          <strong>Subscription</strong> information at the top of the page. This also allows users to easily access{' '}
          <strong>Settings</strong> and <strong>Premium features</strong> pages. <strong>Statistics</strong> are now
          shown by Day, Month, and Hourly. Users can see the highest numbers for users, message count and peak
          concurrent connections at a glance. Also, hide or show each graph by clicking the numbers.
        </p>
      </>
    ),
    date: '2019-12-19',
  },
  {
    category: WhatsNewCategory.Updates,
    title: 'Updates to Sendbird dashboard menu bar',
    text: (
      <>
        <p>
          <strong>Users</strong> and <strong>Settings</strong>, applied to Sendbird's products, are now moved to the top
          of the menu bar. For <strong>Users</strong>, the <strong>User information</strong> page is added so that you
          can find all the information at one place and quickly edit information.
        </p>
      </>
    ),
    date: '2019-12-19',
  },
  {
    category: WhatsNewCategory.Updates,
    title: 'New and improved menu bar design',
    text: (
      <>
        <p>
          The new and improved menu bar design is now rearranged by products, making it easier for you to navigate at a
          glance. Foremost, what used to be <strong>Moderation</strong> is now changed to <strong>Application</strong>.
          Also, you can expand and collapse the menu bar which provides more workspace.
        </p>
        <p>
          Vertically rearranged settings panel is also divided by products, and you can find <strong>Teams</strong> by
          going to <strong>Settings {'>'} Desk</strong>.
        </p>
      </>
    ),
    date: '2019-10-23',
  },
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'New Roles page for your organization',
    text: (
      <>
        <p>
          Organization settings has a new page dedicated to <strong>Roles</strong> and their permissions.
        </p>
        <p>
          In <strong>Roles</strong>, you can create a new role by setting permissions and its access to applications.
        </p>
        <p>
          You can also edit or duplicate the role. Easily manage your applications by assigning different roles to each
          member of your organization.
        </p>
      </>
    ),
    date: '2019-09-06',
  },
  {
    category: WhatsNewCategory.NewFeatures,
    title: 'Now we have What’s new!',
    text: (
      <>
        <p>
          We are now introducing <strong>What's new</strong> for Sendbird dashboard.
        </p>
        <p>
          <strong>What's new</strong> will regularly update everything you need to know about our dashboard improvements
          to new features added.
        </p>
        <p>
          Now, with <strong>What's new</strong>, you can see all updates at once by just clicking the gift box.
        </p>
      </>
    ),
    date: '2019-09-06',
  },
];
