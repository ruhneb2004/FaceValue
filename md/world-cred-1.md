> ## Documentation Index
> Fetch the complete documentation index at: https://docs.world.org/llms.txt
> Use this file to discover all available pages before exploring further.

# Proof of Human

> High assurance biometric credential captured by the Orb and used for uniqueness.

| Property | Value |
| - | - |
| Issued by | [World Foundation](https://world.org/) (verified issuer) |
| Status | Active |
| ID | `1` |
| Sybil resistance | Yes — each human can only have one PoH credential. |
| Validity period | 3 years (the default duration of the credential; generally the maximum recommended sybil resistance window) |
| SDK Reference | Coming soon |

## Introduction

The Proof of Human (PoH) Credential is the highest-assurance credential issued under World ID. Users obtain it by verifying at an Orb, a device that captures iris biometrics by taking images of the iris. The credential is an anonymous proof that the user is a unique, live human.

## Use Cases

Use the PoH Credential when you need a strong guarantee that you are interacting with a unique, live human. It is the right choice for:

* **Sybil resistance**: enforcing one account per human for airdrops, voting, rewards or rate limiting.
* **High-assurance authentication**: gating sensitive actions where you need biometric confidence that you're interacting with the correct, unique human.
* **Proof of personhood**: distinguishing humans from bots, agents and synthetic identities.

## Credential Structure

This credential implements the following attributes beyond the defaults in the [Credential](https://docs.rs/world-id-primitives/latest/world_id_primitives/credential/struct.Credential.html).

<table>
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        `genesis_issued_at`
      </td>

      <td>The Unix timestamp of the user's first PoH credential. Remains constant across credential renewals.</td>
    </tr>

    <tr>
      <td>
        `expires_at`
      </td>

      <td>Unix timestamp when the credential expires. This is currently three years after the most recent issuance.</td>
    </tr>

    <tr>
      <td>
        `associated_data_hash`
      </td>

      <td>
        The PoH credential has no associated data, so this field is always&#x20;
        `FieldElement::ZERO`.
      </td>
    </tr>
  </tbody>
</table>

In addition, the credential implements the following claim:

### Claim 0 - Orb Credential Commitment

A PCP-backed PoH credential includes a commitment to the Orb credential the user
presented at issuance. This allows the PoH Issuer to attest that the credential was
minted from a valid Orb verification without revealing the underlying Orb credential
to relying parties.

| Source | Value |
| - | - |
| Orb credential | `CLAIMS_HASH_V1`-domain Poseidon2 hash of raw Orb-signed `hashes.json`. |

## Credential Renewal

Users can renew their PoH credential to extend its validity as long as the Orb capture is deemed fresh by the issuer. Each renewal updates the credential with `expires_at = now + 3 years` while `genesis_issued_at` remains constant.

## Technical Reference

For issuer endpoints and implementation-specific details, see the [Issuer reference](https://docs.world.org/world-id/reference/issuer-1.md).


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.