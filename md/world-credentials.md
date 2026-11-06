> ## Documentation Index
> Fetch the complete documentation index at: https://docs.world.org/llms.txt
> Use this file to discover all available pages before exploring further.

# Configure Credentials

A [Credential](https://docs.rs/world-id-primitives/latest/world_id_primitives/credential/struct.Credential.html) is a statement an issuer makes about a World ID holder. In IDKit, the credential you request determines what the user proves to your app.

# What you can request with IDKit

| Offering | What it proves | Common SDK path |
| - | - | - |
| Proof of Human | The user is a unique human, backed by anonymous biometric verification by the Orb. | `proofOfHuman` |
| Proof of Attributes (Passport) | The user holds a verified NFC passport credential. | `passport` |
| Proof of Presence (Selfie Check) | A medium-assurance biometric credential using the device camera for liveness and facial similarity. | `selfieCheck` |
| Proof of Attributes (Identity Check) | An attestation that a document-backed property about the user matches your requested attributes. | `identityCheck` with attributes like `minimum_age`, `nationality`, or `document_type`. |

You can also add a liveness check to any preset with `require_user_presence`.

> [!NOTE]
>
> If you have an existing legacy integration, see the [World ID 4.0 migration guide](https://docs.world.org/world-id/4-0-migration.md).

# SDK presets

Preset helpers cover common credential requests: `proofOfHuman`, `passport`, `selfieCheck`, `identityCheck`, and the legacy presets.

The snippets below assume `rp_context` was already generated and signed by your backend. See [Integrate IDKit](https://docs.world.org/world-id/idkit/integrate.md) for the full RP-signing flow.

## Proof of Human

Use `proofOfHuman` for the current World ID 4.0 Proof of Human credential. The preset also includes legacy Orb fallback for users without a World ID 4.0 proof.

**Proof of Human**

```typescript title="JavaScript" theme={"system"}
import { IDKit, proofOfHuman } from "@worldcoin/idkit-core";

const preset = proofOfHuman({ signal: "user-123" });

const request = await IDKit.request({
  app_id: "app_xxxxx",
  action: "my-action",
  rp_context,
  allow_legacy_proofs: true,
}).preset(preset);
```

```tsx title="React" theme={"system"}
import { IDKitRequestWidget, proofOfHuman } from "@worldcoin/idkit";

const preset = proofOfHuman({ signal: "user-123" });

<IDKitRequestWidget
  open={open}
  onOpenChange={setOpen}
  app_id="app_xxxxx"
  action="my-action"
  rp_context={rpContext}
  allow_legacy_proofs={true}
  preset={preset}
  handleVerify={handleVerify}
  onSuccess={(result) => { /* ... */ }}
/>;
```

## Proof of Attributes (Passport)

Use `passport` for the current World ID 4.0 Passport credential. The preset also includes legacy Document fallback for users without a World ID 4.0 proof.

**Passport**

```typescript title="JavaScript" theme={"system"}
import { IDKit, passport } from "@worldcoin/idkit-core";

const preset = passport({ signal: "user-123" });

const request = await IDKit.request({
  app_id: "app_xxxxx",
  action: "my-action",
  rp_context,
  allow_legacy_proofs: true,
}).preset(preset);
```

```tsx title="React" theme={"system"}
import { IDKitRequestWidget, passport } from "@worldcoin/idkit";

const preset = passport({ signal: "user-123" });

<IDKitRequestWidget
  open={open}
  onOpenChange={setOpen}
  app_id="app_xxxxx"
  action="my-action"
  rp_context={rpContext}
  allow_legacy_proofs={true}
  preset={preset}
  handleVerify={handleVerify}
  onSuccess={(result) => { /* ... */ }}
/>;
```

## Proof of Presence (Selfie Check)

Use `CredentialRequest("selfie")` with [session proofs](https://docs.world.org/world-id/idkit/session-proofs.md) to verify
users when they first arrive and when they return. Create a session once, save its
verified `session_id`, then prove that same session on later checks.

Anyone with World ID App can complete the flow—no Orb or document credential is
required.

```typescript theme={"system"}
import { IDKit, CredentialRequest } from "@worldcoin/idkit-core";

const request = await IDKit.createSession({
  app_id: "app_xxxxx",
  rp_context,
}).constraints(CredentialRequest("selfie"));
```

Follow the [session guide](https://docs.world.org/world-id/idkit/session-proofs.md) for the complete
create-and-return flow. Forward the complete result, including `sybil_score` and
`integrity_bundle`, to your backend and only use the score after verification
succeeds.

For a one-time check, use `IDKit.request(...).preset(selfieCheck())` with an
`action` and `allow_legacy_proofs: false`. Each user can complete that action once;
see the [integration guide](https://docs.world.org/world-id/idkit/integrate.md).

If you use `selfieCheckLegacy`, migrate to `selfieCheck` for World ID 4.0.

## Proof of Attributes (Identity Check, Preview)

> [!NOTE]
>
> Identity Check is currently in preview. To use it or learn more, contact us.

Identity Check lets your app ask the user to attest that document-backed attributes match your policy, without handling the underlying document data. Use it for eligibility checks such as minimum age, document type, issuing country, or nationality. Request attributes such as:

| Attribute | Value type |
| - | - |
| `document_type` | `"passport"`, `"eid"` or `"mnc"` |
| `document_number` | `string` |
| `issuing_country` | ISO 3166-1 alpha-3 country code |
| `full_name` | `string` |
| `minimum_age` | `number` |
| `nationality` | ISO 3166-1 alpha-3 country code |

**Identity Check**

```typescript title="JavaScript" theme={"system"}
import { IDKit, identityCheck } from "@worldcoin/idkit-core";

const preset = identityCheck({
  attributes: [
    { type: "document_type", value: "passport" },
    { type: "minimum_age", value: 18 },
  ],
});

const request = await IDKit.request({
  app_id: "app_xxxxx",
  action: "my-action",
  rp_context,
  allow_legacy_proofs: false,
}).preset(preset);
```

```tsx title="React" theme={"system"}
import { IDKitRequestWidget, identityCheck } from "@worldcoin/idkit";

const preset = identityCheck({
  attributes: [
    { type: "document_type", value: "passport" },
    { type: "minimum_age", value: 18 },
  ],
});

<IDKitRequestWidget
  open={open}
  onOpenChange={setOpen}
  app_id="app_xxxxx"
  action="my-action"
  rp_context={rpContext}
  allow_legacy_proofs={false}
  preset={preset}
  handleVerify={handleVerify}
  onSuccess={(result) => { /* ... */ }}
/>;
```

Successful Identity Check responses include `identity_attested` so your backend can tell whether the requested attributes matched.

## User presence and liveness

To check for user presence and liveness, add the `require_user_presence` flag to your request. This is a request-level flag, not a credential; it asks World ID for a fresh liveness check before returning the proof and fails with `user_presence_failed` if the check does not complete.

Depending on the credential requested, World ID matches the user's live selfie to the credential image, such as the passport photo or the image captured during Orb verification.

**User presence**

```typescript title="JavaScript" theme={"system"}
import { IDKit, proofOfHuman } from "@worldcoin/idkit-core";

const preset = proofOfHuman({ signal: "user-123" });

const request = await IDKit.request({
  app_id: "app_xxxxx",
  action: "my-action",
  rp_context,
  allow_legacy_proofs: true,
  require_user_presence: true,
}).preset(preset);
```

```tsx title="React" theme={"system"}
import { IDKitRequestWidget, proofOfHuman } from "@worldcoin/idkit";

const preset = proofOfHuman({ signal: "user-123" });

<IDKitRequestWidget
  open={open}
  onOpenChange={setOpen}
  app_id="app_xxxxx"
  action="my-action"
  rp_context={rpContext}
  allow_legacy_proofs={true}
  require_user_presence={true}
  preset={preset}
  handleVerify={handleVerify}
  onSuccess={(result) => { /* ... */ }}
/>;
```

## Other legacy presets

These presets only return World ID 3.0 proofs. Use them for existing integrations or when you need the older verification level.

<table>
  <thead>
    <tr>
      <th>Preset</th>
      <th>What it requests</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>`orbLegacy`</td>
      <td>Orb verification.</td>
    </tr>

    <tr>
      <td>`secureDocumentLegacy`</td>
      <td>At least a Secure Document verification. Returns the user's highest legacy credential: Secure Document or Orb.</td>
    </tr>

    <tr>
      <td>`documentLegacy`</td>
      <td>At least a Document verification. Returns the user's highest legacy credential: Document, Secure Document, or Orb.</td>
    </tr>

    <tr>
      <td>`deviceLegacy`</td>
      <td>**Deprecated.** Keep `deviceLegacy` only for existing Device integrations. For new integrations, use [Selfie Check](#selfie-check).</td>
    </tr>
  </tbody>
</table>

## Common parameters

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Where it is used</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>`signal`</td>
      <td>Presets</td>
      <td>Binds app context into the proof, such as a user ID or wallet address. Your backend should enforce the same value.</td>
    </tr>

    <tr>
      <td>`allow_legacy_proofs`</td>
      <td>Request config and widgets</td>
      <td>Required for request flows. Set to `true` while accepting World ID 3.0 fallback proofs; set to `false` for World ID 4.0-only requests.</td>
    </tr>

    <tr>
      <td>`require_user_presence`</td>
      <td>Request config and widgets</td>
      <td>Optional liveness step. Defaults to `false`.</td>
    </tr>
  </tbody>
</table>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.