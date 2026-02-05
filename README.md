# Loops JavaScript/TypeScript SDK

## Introduction

This is the official JavaScript SDK for [Loops](https://loops.so), with full TypeScript support.

It lets you easily integrate with the Loops API in any JavaScript project.

## Installation

You can install the package [from npm](https://www.npmjs.com/package/loops):

```bash
npm install loops
```

Minimum Node version required: 18.0.0.

You will need a Loops API key to use the package.

In your Loops account, go to the [API Settings page](https://app.loops.so/settings?page=api) and click "Generate key".

Copy this key and save it in your application code (for example as `LOOPS_API_KEY` in an `.env` file).

See the API documentation to learn more about [rate limiting](https://loops.so/docs/api-reference#rate-limiting) and [error handling](https://loops.so/docs/api-reference#debugging).

## Usage

```javascript
import { LoopsClient, APIError } from "loops";

const loops = new LoopsClient(process.env.LOOPS_API_KEY);

try {
  const resp = await loops.createContact("email@provider.com");
  // resp.success and resp.id available when successful
} catch (error) {
  if (error instanceof APIError) {
    // JSON returned by the API is in error.json and the HTTP code is in error.statusCode
    // error.json may be null if the response was not valid JSON (e.g., from a load balancer)
    // In that case, the raw response text is available in error.rawBody
    console.log(error.json);
    console.log(error.statusCode);
    console.log(error.rawBody);
  } else {
    // Non-API errors
  }
}
```

## Handling rate limits

If you import `RateLimitExceededError` you can check for rate limit issues with your requests.

You can access details about the rate limits from the `limit` and `remaining` attributes.

```javascript
import { LoopsClient, APIError, RateLimitExceededError } from "loops";

const loops = new LoopsClient(process.env.LOOPS_API_KEY);

try {
  const resp = await loops.createContact("email@provider.com");
} catch (error) {
  if (error instanceof RateLimitExceededError) {
    console.log(`Rate limit exceeded (${error.limit} per second)`);
    // Code here to re-try this request
  } else {
    // Handle other errors
  }
}
```

## Default contact properties

Each contact in Loops has a set of default properties. These will always be returned in API results.

- `id`
- `email`
- `firstName`
- `lastName`
- `source`
- `subscribed`
- `userGroup`
- `userId`
- `optInStatus`

## Custom contact properties

You can use custom contact properties in API calls. Please make sure to [add custom properties](https://loops.so/docs/contacts/properties#custom-contact-properties) in your Loops account before using them with the SDK.

## Methods

- [testApiKey()](#testapikey)
- [createContact()](#createcontact)
- [updateContact()](#updatecontact)
- [findContact()](#findcontact)
- [deleteContact()](#deletecontact)
- [createContactProperty()](#createcontactproperty)
- [getContactProperties()](#getcontactproperties)
- [getMailingLists()](#getmailinglists)
- [sendEvent()](#sendevent)
- [sendTransactionalEmail()](#sendtransactionalemail)
- [getTransactionalEmails()](#gettransactionalemails)

---

### testApiKey()

Test that an API key is valid.

[API Reference](https://loops.so/docs/api-reference/api-key)

#### Parameters

None

#### Example

```javascript
const resp = await loops.testApiKey();
```

#### Response

```json
{
  "success": true,
  "teamName": "My team"
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 401 Unauthorized
{
  "error": "Invalid API key"
}
```

---

### createContact()

Create a new contact.

[API Reference](https://loops.so/docs/api-reference/create-contact)

#### Parameters

| Name           | Type   | Required | Notes                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email`        | string | Yes      | If a contact already exists with this email address, an error response will be returned.                                                                                                                                                                                                                                                                                                                             |
| `properties`   | object | No       | An object containing default and any custom properties for your contact.<br />Please [add custom properties](https://loops.so/docs/contacts/properties#custom-contact-properties) in your Loops account before using them with the SDK.<br />Values can be of type `string`, `number`, `null` (to reset a value), `boolean` or `date` ([see allowed date formats](https://loops.so/docs/contacts/properties#dates)). |
| `mailingLists` | object | No       | An object of mailing list IDs and boolean subscription statuses.                                                                                                                                                                                                                                                                                                                                                     |

#### Examples

```javascript
const resp = await loops.createContact({ email: "hello@gmail.com" });

const contactProperties = {
  firstName: "Bob" /* Default property */,
  favoriteColor: "Red" /* Custom property */,
};
const mailingLists = {
  cm06f5v0e45nf0ml5754o9cix: true /* Subscribe */,
  cm16k73gq014h0mmj5b6jdi9r: false /* Unsubscribe */,
};
const resp = await loops.createContact({
  email: "hello@gmail.com",
  properties: contactProperties,
  mailingLists,
});
```

#### Response

```json
{
  "success": true,
  "id": "id_of_contact"
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "An error message here."
}
```

---

### updateContact()

Update a contact. This method will create a contact if one doesn't already exist.

Note: To update a contact's email address, the contact requires a `userId` value. Then you can make a request with their `userId` and an updated email address.

[API Reference](https://loops.so/docs/api-reference/update-contact)

#### Parameters

| Name           | Type   | Required | Notes                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email`        | string | No       | The email address of the contact to update. If there is no contact with this email address, a new contact will be created using the email and properties in this request. Required if `userId` is not present.                                                                                                                                                                                                       |
| `userId`       | string | No       | The contact's unique user ID. If you use `userId` without `email`, this value must have already been added to your contact in Loops. Required if `email` is not present.                                                                                                                                                                                                                                             |
| `properties`   | object | No       | An object containing default and any custom properties for your contact.<br />Please [add custom properties](https://loops.so/docs/contacts/properties#custom-contact-properties) in your Loops account before using them with the SDK.<br />Values can be of type `string`, `number`, `null` (to reset a value), `boolean` or `date` ([see allowed date formats](https://loops.so/docs/contacts/properties#dates)). |
| `mailingLists` | object | No       | An object of mailing list IDs and boolean subscription statuses.                                                                                                                                                                                                                                                                                                                                                     |

#### Example

```javascript
const resp = await loops.updateContact({
  email: "hello@gmail.com",
  properties: {
    firstName: "Bob" /* Default property */,
    favoriteColor: "Blue" /* Custom property */,
  },
});

/* Updating a contact's email address using userId */
const resp = await loops.updateContact({
  userId: "1234",
  email: "newemail@gmail.com",
});

/* Subscribe a contact to a mailing list */
const resp = await loops.updateContact({
  email: "hello@gmail.com",
  mailingLists: {
    cm06f5v0e45nf0ml5754o9cix: true,
  },
});
```

#### Response

```json
{
  "success": true,
  "id": "id_of_contact"
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "An error message here."
}
```

---

### findContact()

Find a contact.

[API Reference](https://loops.so/docs/api-reference/find-contact)

#### Parameters

You must use one parameter in the request.

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| `email`  | string | No       |       |
| `userId` | string | No       |       |

#### Examples

```javascript
const resp = await loops.findContact({ email: "hello@gmail.com" });

const resp = await loops.findContact({ userId: "12345" });
```

#### Response

This method will return a list containing a single contact object, which will include all default properties and any custom properties.

If no contact is found, an empty list will be returned.

```json
[
  {
    "id": "cll6b3i8901a9jx0oyktl2m4u",
    "email": "hello@gmail.com",
    "firstName": "Bob",
    "lastName": null,
    "source": "API",
    "subscribed": true,
    "userGroup": "",
    "userId": "12345",
    "mailingLists": {
      "cm06f5v0e45nf0ml5754o9cix": true
    },
    "optInStatus": null,
    "favoriteColor": "Blue" /* Custom property */
  }
]
```

---

### deleteContact()

Delete a contact, either by email address or `userId`.

[API Reference](https://loops.so/docs/api-reference/delete-contact)

#### Parameters

You must use one parameter in the request.

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| `email`  | string | No       |       |
| `userId` | string | No       |       |

#### Example

```javascript
const resp = await loops.deleteContact({ email: "hello@gmail.com" });

const resp = await loops.deleteContact({ userId: "12345" });
```

#### Response

```json
{
  "success": true,
  "message": "Contact deleted."
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "An error message here."
}
```

```json
HTTP 404 Not Found
{
  "success": false,
  "message": "An error message here."
}
```

---

### createContactProperty()

Create a new contact property.

[API Reference](https://loops.so/docs/api-reference/create-contact-property)

#### Parameters

| Name   | Type   | Required | Notes                                                                                  |
| ------ | ------ | -------- | -------------------------------------------------------------------------------------- |
| `name` | string | Yes      | The name of the property. Should be in camelCase, like `planName` or `favouriteColor`. |
| `type` | string | Yes      | The property's value type.<br />Can be one of `string`, `number`, `boolean` or `date`. |

#### Examples

```javascript
const resp = await loops.createContactProperty("planName", "string");
```

#### Response

```json
{
  "success": true
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "An error message here."
}
```

---

### getContactProperties()

Get a list of your account's contact properties.

[API Reference](https://loops.so/docs/api-reference/list-contact-properties)

#### Parameters

| Name   | Type   | Required | Notes                                                           |
| ------ | ------ | -------- | --------------------------------------------------------------- |
| `list` | string | No       | Use "custom" to retrieve only your account's custom properties. |

#### Example

```javascript
const resp = await loops.getContactProperties();

const resp = await loops.getContactProperties("custom");
```

#### Response

This method will return a list of contact property objects containing `key`, `label` and `type` attributes.

```json
[
  {
    "key": "firstName",
    "label": "First Name",
    "type": "string"
  },
  {
    "key": "lastName",
    "label": "Last Name",
    "type": "string"
  },
  {
    "key": "email",
    "label": "Email",
    "type": "string"
  },
  {
    "key": "notes",
    "label": "Notes",
    "type": "string"
  },
  {
    "key": "source",
    "label": "Source",
    "type": "string"
  },
  {
    "key": "userGroup",
    "label": "User Group",
    "type": "string"
  },
  {
    "key": "userId",
    "label": "User Id",
    "type": "string"
  },
  {
    "key": "subscribed",
    "label": "Subscribed",
    "type": "boolean"
  },
  {
    "key": "createdAt",
    "label": "Created At",
    "type": "date"
  },
  {
    "key": "favoriteColor",
    "label": "Favorite Color",
    "type": "string"
  },
  {
    "key": "plan",
    "label": "Plan",
    "type": "string"
  }
]
```

---

### getMailingLists()

Get a list of your account's mailing lists. [Read more about mailing lists](https://loops.so/docs/contacts/mailing-lists)

[API Reference](https://loops.so/docs/api-reference/list-mailing-lists)

#### Parameters

None

#### Example

```javascript
const resp = await loops.getMailingLists();
```

#### Response

This method will return a list of mailing list objects containing `id`, `name`, `description` and `isPublic` attributes.

If your account has no mailing lists, an empty list will be returned.

```json
[
  {
    "id": "cm06f5v0e45nf0ml5754o9cix",
    "name": "Main list",
    "description": "All customers.",
    "isPublic": true
  },
  {
    "id": "cm16k73gq014h0mmj5b6jdi9r",
    "name": "Investors",
    "description": null,
    "isPublic": false
  }
]
```

---

### sendEvent()

Send an event to trigger an email in Loops. [Read more about events](https://loops.so/docs/events)

[API Reference](https://loops.so/docs/api-reference/send-event)

#### Parameters

| Name                | Type   | Required | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email`             | string | No       | The contact's email address. Required if `userId` is not present.                                                                                                                                                                                                                                                                                                                                                                                              |
| `userId`            | string | No       | The contact's unique user ID. If you use `userId` without `email`, this value must have already been added to your contact in Loops. Required if `email` is not present.                                                                                                                                                                                                                                                                                       |
| `eventName`         | string | Yes      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `contactProperties` | object | No       | An object containing contact properties, which will be updated or added to the contact when the event is received.<br />Please [add custom properties](https://loops.so/docs/contacts/properties#custom-contact-properties) in your Loops account before using them with the SDK.<br />Values can be of type `string`, `number`, `null` (to reset a value), `boolean` or `date` ([see allowed date formats](https://loops.so/docs/contacts/properties#dates)). |
| `eventProperties`   | object | No       | An object containing event properties, which will be made available in emails that are triggered by this event.<br />Values can be of type `string`, `number`, `boolean` or `date` ([see allowed date formats](https://loops.so/docs/events/properties#important-information-about-event-properties)).                                                                                                                                                         |
| `mailingLists`      | object | No       | An object of mailing list IDs and boolean subscription statuses.                                                                                                                                                                                                                                                                                                                                                                                               |
| `headers`           | object | No       | Additional headers to send with the request.                                                                                                                                                                                                                                                                                                                                                                                                                   |

#### Examples

```javascript
const resp = await loops.sendEvent({
  email: "hello@gmail.com",
  eventName: "signup",
});

const resp = await loops.sendEvent({
  email: "hello@gmail.com",
  eventName: "signup",
  eventProperties: {
    username: "user1234",
    signupDate: "2024-03-21T10:09:23Z",
  },
  mailingLists: {
    cm06f5v0e45nf0ml5754o9cix: true,
    cm16k73gq014h0mmj5b6jdi9r: false,
  },
});

// In this case with both email and userId present, the system will look for a contact with either a
//  matching `email` or `userId` value.
// If a contact is found for one of the values (e.g. `email`), the other value (e.g. `userId`) will be updated.
// If a contact is not found, a new contact will be created using both `email` and `userId` values.
// Any values added in `contactProperties` will also be updated on the contact.
const resp = await loops.sendEvent({
  userId: "1234567890",
  email: "hello@gmail.com",
  eventName: "signup",
  contactProperties: {
    firstName: "Bob",
    plan: "pro",
  },
});

// Example with Idempotency-Key header
const resp = await loops.sendEvent({
  email: "hello@gmail.com",
  eventName: "signup",
  headers: {
    "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000",
  },
});
```

#### Response

```json
{
  "success": true
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "An error message here."
}
```

---

### sendTransactionalEmail()

Send a transactional email to a contact. [Learn about sending transactional email](https://loops.so/docs/transactional/guide)

[API Reference](https://loops.so/docs/api-reference/send-transactional-email)

#### Parameters

| Name                        | Type     | Required | Notes                                                                                                                                                                                                         |
| --------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transactionalId`           | string   | Yes      | The ID of the transactional email to send.                                                                                                                                                                    |
| `email`                     | string   | Yes      | The email address of the recipient.                                                                                                                                                                           |
| `addToAudience`             | boolean  | No       | If `true`, a contact will be created in your audience using the `email` value (if a matching contact doesn’t already exist).                                                                                  |
| `dataVariables`             | object   | No       | An object containing data as defined by the data variables added to the transactional email template.<br />Values can be of type `string`, `number`, or an array of objects with `string` or `number` values. |
| `attachments`               | object[] | No       | A list of attachments objects.<br />**Please note**: Attachments need to be enabled on your account before using them with the API. [Read more](https://loops.so/docs/transactional/attachments)              |
| `attachments[].filename`    | string   | No       | The name of the file, shown in email clients.                                                                                                                                                                 |
| `attachments[].contentType` | string   | No       | The MIME type of the file.                                                                                                                                                                                    |
| `attachments[].data`        | string   | No       | The base64-encoded content of the file.                                                                                                                                                                       |
| `headers`                   | object   | No       | Additional headers to send with the request.                                                                                                                                                                  |

#### Examples

```javascript
const resp = await loops.sendTransactionalEmail({
  transactionalId: "clfq6dinn000yl70fgwwyp82l",
  email: "hello@gmail.com",
  dataVariables: {
    loginUrl: "https://myapp.com/login/",
  },
});

// Example with Idempotency-Key header
const resp = await loops.sendTransactionalEmail({
  transactionalId: "clfq6dinn000yl70fgwwyp82l",
  email: "hello@gmail.com",
  dataVariables: {
    loginUrl: "https://myapp.com/login/",
  },
  headers: {
    "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000",
  },
});

// Please contact us to enable attachments on your account.
const resp = await loops.sendTransactionalEmail({
  transactionalId: "clfq6dinn000yl70fgwwyp82l",
  email: "hello@gmail.com",
  dataVariables: {
    loginUrl: "https://myapp.com/login/",
  },
  attachments: [
    {
      filename: "presentation.pdf",
      contentType: "application/pdf",
      data: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPD...",
    },
  ],
});
```

#### Response

```json
{
  "success": true
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "path": "dataVariables",
  "message": "There are required fields for this email. You need to include a 'dataVariables' object with the required fields."
}
```

```json
HTTP 400 Bad Request
{
  "success": false,
  "error": {
    "path": "dataVariables",
    "message": "Missing required fields: login_url"
  },
  "transactionalId": "clfq6dinn000yl70fgwwyp82l"
}
```

---

### getTransactionalEmails()

Get a list of published transactional emails.

[API Reference](https://loops.so/docs/api-reference/list-transactional-emails)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.getTransactionalEmails();

const resp = await loops.getTransactionalEmails({ perPage: 15 });
```

#### Response

```json
{
  "pagination": {
    "totalResults": 23,
    "returnedResults": 20,
    "perPage": 20,
    "totalPages": 2,
    "nextCursor": "clyo0q4wo01p59fsecyxqsh38",
    "nextPage": "https://app.loops.so/api/v1/transactional?cursor=clyo0q4wo01p59fsecyxqsh38&perPage=20"
  },
  "data": [
    {
      "id": "clfn0k1yg001imo0fdeqg30i8",
      "lastUpdated": "2023-11-06T17:48:07.249Z",
      "dataVariables": []
    },
    {
      "id": "cll42l54f20i1la0lfooe3z12",
      "lastUpdated": "2025-02-02T02:56:28.845Z",
      "dataVariables": [
        "confirmationUrl"
      ]
    },
    {
      "id": "clw6rbuwp01rmeiyndm80155l",
      "lastUpdated": "2024-05-14T19:02:52.000Z",
      "dataVariables": [
        "firstName",
        "lastName",
        "inviteLink"
      ]
    },
    ...
  ]
}
```

---

## Version history

- `v6.1.3` (Feb 5, 2026) - Updated `TransactionalVariables` type to support arrays of objects with `string` or `number` values in [`sendTransactionalEmail()`](#sendtransactionalemail).
- `v6.1.2` (Jan 29, 2026) - Added `rawBody` to `APIError` in the case no JSON is received from the server (thanks to [@leipert](https://github.com/leipert)).
- `v6.0.1` (Oct 15, 2025) - Added `optInStatus` to contact object in [`findContact()`](#findcontact) for the new double opt-in feature.
- `v6.0.0` (Aug 22, 2025) - [`createContact()`](#createcontact) and [`updateContact()`](#updatecontact) now have a single object parameter instead of named parameters (breaking change). This allows support for using either `email` or `userId` when updating contacts.
- `v5.0.1` (May 13, 2025) - Added a `headers` parameter for [`sendEvent()`](#sendevent) and [`sendTransactionalEmail()`](#sendtransactionalemail), enabling support for the `Idempotency-Key` header.
- `v5.0.0` (Apr 29, 2025)
  - Types are now exported so you can use them in your application.
  - `ValidationError` is now thrown when parameters are not added correctly.
  - `Error` is now returned if the API key is missing.
  - Added tests.
- `v4.1.0` (Feb 27, 2025) - Support for new [List transactional emails](#gettransactionalemails) endpoint.
- `v4.0.0` (Jan 16, 2025)
  - Added `APIError` to more easily understand API errors. [See usage example](#usage).
  - Added support for two new contact property endpoints: [List contact properties](#listcontactproperties) and [Create contact property](#createcontactproperty).
  - Deprecated and removed the `getCustomFields()` method (you can now use [`listContactProperties()`](#listcontactproperties) instead).
- `v3.4.1` (Dec 18, 2024) - Support for a new `description` attribute in [`getMailingLists()`](#getmailinglists).
- `v3.4.0` (Oct 29, 2024) - Added rate limit handling with [`RateLimitExceededError`](#handling-rate-limits).
- `v3.3.0` (Sep 9, 2024) - Added [`testApiKey()`](#testapikey) method.
- `v3.2.0` (Aug 23, 2024) - Added support for a new `mailingLists` attribute in [`findContact()`](#findcontact).
- `v3.1.1` (Aug 16, 2024) - Support for a new `isPublic` attribute in [`getMailingLists()`](#getmailinglists).
- `v3.1.0` (Aug 12, 2024) - The SDK now accepts `null` as a value for contact properties in `createContact()`, `updateContact()` and `sendEvent()`, which allows you to reset/empty properties.
- `v3.0.0` (Jul 2, 2024) - [`sendTransactionalEmail()`](#sendtransactionalemail) now accepts an object instead of separate parameters (breaking change).
- `v2.2.0` (Jul 2, 2024) - Deprecated. Added new `addToAudience` option to [`sendTransactionalEmail()`](#sendtransactionalemail).
- `v2.1.1` (Jun 20, 2024) - Added support for mailing lists in [`createContact()`](#createcontact), [`updateContact()`](#updatecontact) and [`sendEvent()`](#sendevent).
- `v2.1.0` (Jun 19, 2024) - Added support for new [List mailing lists](#getmailinglists) endpoint.
- `v2.0.0` (Apr 19, 2024)
  - Added `userId` as a parameter to [`findContact()`](#findcontact). This includes a breaking change for the `findContact()` parameters.
  - `userId` values must now be strings (could have also been numbers previously).
- `v1.0.1` (Apr 1, 2024) - Fixed types for `sendEvent()`.
- `v1.0.0` (Mar 28, 2024) - Fix for ESM types. Switched to named export.
- `v0.4.0` (Mar 22, 2024) - Support for new `eventProperties` in [`sendEvent()`](#sendevent). This includes a breaking change for the `sendEvent()` parameters.
- `v0.3.0` (Feb 22, 2024) - Updated minimum Node version to 18.0.0.
- `v0.2.1` (Feb 6, 2024) - Fix for ESM imports.
- `v0.2.0` (Feb 1, 2024) - CommonJS support.
- `v0.1.5` (Jan 25, 2024) - `getCustomFields()` now returns `type` values for each contact property.
- `v0.1.4` (Jan 25, 2024) - Added support for `userId` in [`sendEvent()`](#sendevent) request. Added missing error response type for `sendEvent()` requests.
- `v0.1.3` (Dec 8, 2023) - Added support for transactional attachments.
- `v0.1.2` (Dec 6, 2023) - Improved transactional error types.
- `v0.1.1` (Nov 1, 2023) - Initial release.

---

## Tests

Run tests with `npm run test`.

---

## Contributing

Bug reports and pull requests are welcome. Please read our [Contributing Guidelines](CONTRIBUTING.md).
