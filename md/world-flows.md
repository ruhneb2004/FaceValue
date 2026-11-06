> ## Documentation Index
> Fetch the complete documentation index at: https://docs.world.org/llms.txt
> Use this file to discover all available pages before exploring further.

# Verification Flows

> The flows your integration can land users in when you request a World ID proof.

When your app requests a World ID proof, the user lands in one of three flows, determined by whether they have World ID installed and — if not — whether they already have a World ID.

> [!NOTE]
>
> The integration flow is the same for all three paths, but the user experience differs.

| Flow | World ID installed | Existing account | What happens |
| - | - | - | - |
| Hot | Yes | — | World ID opens, shows a proof consent, and the user approves — typically under 10 seconds. If the user lacks the requested [credential](https://docs.world.org/world-id/idkit/credentials.md), World ID walks them through enrollment first; your integration sees no difference. |
| Cold | No | No | The user installs World ID and completes account onboarding first. The experience differs by platform — see below. |
| Semi-cold | No | Yes | The user installs World ID and logs in to their existing account. **Android:** the flow resumes automatically. **iOS:** the user must return to your app and rescan, unless you use invite-code mode — see below. |

## Cold and semi-cold flows

Both flows require an install and behave differently per platform because of how each handles **deferred deep linking** — preserving a link's context through an app store install so the app can act on it at first launch.

### Android

Android supports deferred deep linking through the Play Store. After downloading World ID, the user creates an account (cold) or logs in to an existing one (semi-cold), and World ID resumes the verification flow automatically.

```mermaid theme={"system"}
sequenceDiagram
    participant App as Your App
    participant User
    participant Play as Play Store
    participant WA as World ID

    App->>User: IDKit request (connect URL / QR)
    User->>Play: Download World ID
    Play-->>WA: Deferred deep link preserved

    WA->>User: Account onboarding OR Login
    opt Credential not yet held
      WA->>User: Credential enrollment
    end
    WA->>User: Proof consent
    User->>WA: Approve
    WA-->>App: Proof returned
```

### iOS

iOS does not support deferred deep linking through the App Store. Install loses the original verification context — for both cold and semi-cold users — so resuming the flow requires additional mechanisms.

#### Default behavior

1. The user downloads World ID from the App Store and creates an account or logs in to an existing one.
2. The user returns to your app, which re-triggers the IDKit verification request (e.g., by rescanning the QR code).
3. World ID opens and takes the user through the standard in-app flow.
4. The proof consent appears, the user approves, and the proof returns to your app.

```mermaid theme={"system"}
sequenceDiagram
    participant App as Your App
    participant User
    participant Store as App Store
    participant WA as World ID

    App->>User: Prompt to install World ID
    User->>Store: Download World ID
    WA->>User: Account onboarding OR Login
    User->>App: Return to your app
    App->>User: IDKit request (rescan QR / connect URL)
    WA->>User: Standard in-app flow
    WA-->>App: Proof returned
```

#### With invite-code mode

Invite-code mode shows a 6-character code in your app that the user enters into World ID. World ID treats the code as an entry point to the in-app onboarding flows the user must complete to satisfy your IDKit request, then returns the proof.

> [!NOTE]
>
> Invite-code mode exists because iOS lacks deferred deep linking — Android preserves the context via the Play Store.

1. Your app triggers an IDKit invite-code request.
2. Your app opens the URL that IDKit provides. One of three paths follows:
   * **User has World ID (mobile):** World ID launches directly via deep link.
   * **User has World ID (desktop):** The user scans the QR code with World ID.
   * **User needs to install World ID:** The user installs World ID, completes onboarding or logs in, then enters the invite code to resume the request.
3. World ID restores the verification context, walks the user through credential enrollment if needed, and presents a proof consent.
4. The user approves and the proof returns to your app.

The 6-character code persists across the App Store install, so once World ID is installed and onboarded the user can resume the flow without first returning to your app. This also covers cross-device scenarios (e.g., a desktop browser showing the QR for the user's phone) where deep linking cannot carry context.

**Demo**

<video width="700" autoPlay muted loop playsInline>
  <source src="https://mintcdn.com/tfh/vf24gcPg4ECaGO8T/images/docs/world-id/idkit/invite-code-demo.mp4?fit=max&auto=format&n=vf24gcPg4ECaGO8T&q=85&s=d499c28114e78efbdbd00953adc1e589" type="video/mp4" />
</video>

**Flow diagram**

```mermaid theme={"system"}
sequenceDiagram
    participant App as Your App
    participant User
    participant LP as Landing Page
    participant Store as App Store
    participant WA as World ID

    App->>LP: Open IDKit-provided URL
    LP->>User: Display invite code + QR
    User->>Store: Download World ID
    WA->>User: Account onboarding OR Login
    User->>WA: Enter invite code
    WA->>WA: Resolve code & restore context
    WA->>User: Credential enrollment
    WA->>User: Proof consent
    User->>WA: Approve
    WA-->>App: Proof returned
```

**Lifecycle**

* Codes expire after a short TTL (currently fifteen minutes).
* Codes are one-shot — once redeemed, they cannot be reused. Re-running the request returns a fresh code with a fresh TTL.
* After the user redeems the code, your existing poll loop receives the proof exactly as in QR mode.

**Integrate**

Setup is identical to the [standard integration](https://docs.world.org/world-id/idkit/integrate.md) — only the request call changes. Choose the appropriate preset in [Configure Credentials](https://docs.world.org/world-id/idkit/credentials.md). For code samples and migration guides, see the per-SDK sections: [JavaScript](https://docs.world.org/world-id/idkit/javascript.md#invite-code-mode), [React](https://docs.world.org/world-id/idkit/react.md#invite-code-mode), [Swift](https://docs.world.org/world-id/idkit/swift.md#invite-code-mode).


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.