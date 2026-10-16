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
  const resp = await loops.createContact({ email: "email@provider.com" });
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
  const resp = await loops.createContact({ email: "email@provider.com" });
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
- `mailingLists`
- `optInStatus`

## Custom contact properties

You can use custom contact properties in API calls. Please make sure to [add custom properties](https://loops.so/docs/contacts/properties#custom-contact-properties) in your Loops account before using them with the SDK.

## Methods

- [testApiKey()](#testapikey)
- [createContact()](#createcontact)
- [updateContact()](#updatecontact)
- [findContact()](#findcontact)
- [deleteContact()](#deletecontact)
- [checkContactSuppression()](#checkcontactsuppression)
- [removeContactSuppression()](#removecontactsuppression)
- [createContactProperty()](#createcontactproperty)
- [listContactProperties()](#listcontactproperties)
- [listMailingLists()](#listmailinglists)
- [sendEvent()](#sendevent)
- [sendTransactionalEmail()](#sendtransactionalemail)
- [listTransactionalEmails()](#listtransactionalemails)
- [getTransactionalEmail()](#gettransactionalemail)
- [createTransactionalEmail()](#createtransactionalemail)
- [updateTransactionalEmail()](#updatetransactionalemail)
- [ensureTransactionalEmailDraft()](#ensuretransactionalemaildraft)
- [publishTransactionalEmail()](#publishtransactionalemail)
- [listDedicatedSendingIps()](#listdedicatedsendingips)
- [listThemes()](#listthemes)
- [getTheme()](#gettheme)
- [createTheme()](#createtheme)
- [updateTheme()](#updatetheme)
- [listComponents()](#listcomponents)
- [getComponent()](#getcomponent)
- [createComponent()](#createcomponent)
- [updateComponent()](#updatecomponent)
- [listCampaigns()](#listcampaigns)
- [createCampaign()](#createcampaign)
- [getCampaign()](#getcampaign)
- [updateCampaign()](#updatecampaign)
- [getEmailMessage()](#getemailmessage)
- [updateEmailMessage()](#updateemailmessage)
- [listTransactionalGroups()](#listtransactionalgroups)
- [createTransactionalGroup()](#createtransactionalgroup)
- [getTransactionalGroup()](#gettransactionalgroup)
- [updateTransactionalGroup()](#updatetransactionalgroup)
- [listAudienceSegments()](#listaudiencesegments)
- [getAudienceSegment()](#getaudiencesegment)
- [createAudienceSegment()](#createaudiencesegment)
- [listCampaignGroups()](#listcampaigngroups)
- [createCampaignGroup()](#createcampaigngroup)
- [getCampaignGroup()](#getcampaigngroup)
- [updateCampaignGroup()](#updatecampaigngroup)
- [sendEmailMessagePreview()](#sendemailmessagepreview)
- [runEmailMessageGuardian()](#runemailmessageguardian)
- [listEventPatterns()](#listeventpatterns)
- [getEventPattern()](#geteventpattern)
- [getEventPatternByName()](#geteventpatternbyname)
- [listWorkflows()](#listworkflows)
- [createWorkflow()](#createworkflow)
- [getWorkflow()](#getworkflow)
- [updateWorkflow()](#updateworkflow)
- [deleteWorkflow()](#deleteworkflow)
- [changeWorkflowMailingList()](#changeworkflowmailinglist)
- [createWorkflowNode()](#createworkflownode)
- [getWorkflowNode()](#getworkflownode)
- [updateWorkflowNode()](#updateworkflownode)
- [deleteWorkflowNode()](#deleteworkflownode)
- [addWorkflowBranch()](#addworkflowbranch)
- [rerouteWorkflowNode()](#rerouteworkflownode)
- [deleteWorkflowNodesRecursive()](#deleteworkflownodesrecursive)
- [createUpload()](#createupload)
- [completeUpload()](#completeupload)

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
  "id": "clw9h3y5a014yl70k9m2n4p8q"
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
  "id": "clw9h3y5a014yl70k9m2n4p8q"
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

### checkContactSuppression()

Check whether a contact is suppressed, either by email address or `userId`.

[API Reference](https://loops.so/docs/api-reference/check-contact-suppression)

#### Parameters

You must use one parameter in the request.

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| `email`  | string | No       |       |
| `userId` | string | No       |       |

#### Example

```javascript
const resp = await loops.checkContactSuppression({ email: "hello@gmail.com" });

const resp = await loops.checkContactSuppression({ userId: "12345" });
```

#### Response

```json
{
  "contact": {
    "id": "cll6b3i8901a9jx0oyktl2m4u",
    "email": "adam@loops.so",
    "userId": null
  },
  "isSuppressed": true,
  "removalQuota": {
    "limit": 100,
    "remaining": 4
  }
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "An email or userId is required."
}
```

```json
HTTP 404 Not Found
{
  "success": false,
  "message": "This contact was not found."
}
```

---

### removeContactSuppression()

Remove suppression for a contact, either by email address or `userId`.

[API Reference](https://loops.so/docs/api-reference/remove-contact-suppression)

#### Parameters

You must use one parameter in the request.

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| `email`  | string | No       |       |
| `userId` | string | No       |       |

#### Example

```javascript
const resp = await loops.removeContactSuppression({ email: "hello@gmail.com" });

const resp = await loops.removeContactSuppression({ userId: "12345" });
```

#### Response

```json
{
  "success": true,
  "message": "Email removed from suppression list.",
  "removalQuota": {
    "limit": 100,
    "remaining": 4
  }
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "This contact is not suppressed."
}
```

```json
HTTP 404 Not Found
{
  "success": false,
  "message": "This contact was not found."
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

### listContactProperties()

Get a list of your account's contact properties.

[API Reference](https://loops.so/docs/api-reference/list-contact-properties)

#### Parameters

| Name   | Type   | Required | Notes                                                           |
| ------ | ------ | -------- | --------------------------------------------------------------- |
| `list` | string | No       | Use "custom" to retrieve only your account's custom properties. |

#### Example

```javascript
const resp = await loops.listContactProperties();

const resp = await loops.listContactProperties("custom");
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

### listMailingLists()

Get a list of your account's mailing lists. [Read more about mailing lists](https://loops.so/docs/contacts/mailing-lists)

[API Reference](https://loops.so/docs/api-reference/list-mailing-lists)

#### Parameters

None

#### Example

```javascript
const resp = await loops.listMailingLists();
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

### listTransactionalEmails()

Get a paginated list of transactional emails, most recently created first.

[API Reference](https://loops.so/docs/api-reference/list-transactional-emails)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listTransactionalEmails();

const resp = await loops.listTransactionalEmails({ perPage: 15 });
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
    "nextPage": "https://app.loops.so/api/v1/transactional-emails?cursor=clyo0q4wo01p59fsecyxqsh38&perPage=20"
  },
  "data": [
    {
      "id": "clfn0k1yg001imo0fdeqg30i8",
      "url": "https://app.loops.so/transactional/clfn0k1yg001imo0fdeqg30i8",
      "name": "Sign up confirmation",
      "draftEmailMessageId": null,
      "publishedEmailMessageId": "clm9x3o5q002yl70a8b3c4d5e",
      "transactionalGroupId": null,
      "createdAt": "2023-11-06T17:48:07.249Z",
      "updatedAt": "2023-11-06T17:48:07.249Z",
      "dataVariables": []
    },
    {
      "id": "cll42l54f20i1la0lfooe3z12",
      "url": "https://app.loops.so/transactional/cll42l54f20i1la0lfooe3z12",
      "name": "Password reset",
      "draftEmailMessageId": "clm8k2n4p000yl70f6g7h8i9j",
      "publishedEmailMessageId": "clm8k2n4p001yl70k1l2m3n4o",
      "transactionalGroupId": "clg7n5p3q1r9s7t5u3v1w9y7",
      "createdAt": "2025-02-02T02:56:28.845Z",
      "updatedAt": "2025-02-02T02:56:28.845Z",
      "dataVariables": [
        "confirmationUrl"
      ]
    },
    ...
  ]
}
```

---

### getTransactionalEmail()

Retrieve a single transactional email by ID.

[API Reference](https://loops.so/docs/api-reference/get-transactional-email)

#### Parameters

| Name                  | Type   | Required | Notes                                |
| --------------------- | ------ | -------- | ------------------------------------ |
| `transactionalId`                  | string | Yes      | The ID of the transactional email.   |

#### Example

```javascript
const resp = await loops.getTransactionalEmail("cll42l54f20i1la0lfooe3z12");
```

#### Response

```json
{
  "id": "cll42l54f20i1la0lfooe3z12",
  "url": "https://app.loops.so/transactional/cll42l54f20i1la0lfooe3z12",
  "name": "Sign up confirmation",
  "draftEmailMessageId": "cle5f7g9h1i3j5k7l9m1n3p5",
  "publishedEmailMessageId": "cle5f7g9h1i3j5k7l9m1n3p5",
  "transactionalGroupId": "clg7n5p3q1r9s7t5u3v1w9y7",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "dataVariables": [
    "confirmationUrl"
  ]
}
```

---

### createTransactionalEmail()

Create a new transactional email. An empty draft email message is created automatically.

[API Reference](https://loops.so/docs/api-reference/create-transactional-email)

#### Parameters

| Name                  | Type   | Required | Notes                                                                                    |
| --------------------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| `name`                | string | Yes      | The name of the transactional email.                                                     |
| `transactionalGroupId`| string | No       | The ID of the group to add this transactional email to. Defaults to the team's default group. |

#### Example

```javascript
const resp = await loops.createTransactionalEmail({ name: "Welcome email" });
```

#### Response

```json
{
  "id": "cll42l54f20i1la0lfooe3z12",
  "url": "https://app.loops.so/transactional/cll42l54f20i1la0lfooe3z12",
  "name": "Welcome email",
  "draftEmailMessageId": "cle5f7g9h1i3j5k7l9m1n3p5",
  "draftEmailMessageContentRevisionId": "clrev1s10n2i3d4e5f6g7h8",
  "publishedEmailMessageId": null,
  "transactionalGroupId": "clg7n5p3q1r9s7t5u3v1w9y7",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "dataVariables": []
}
```

---

### updateTransactionalEmail()

Update a transactional email by ID. At least one field is required.

[API Reference](https://loops.so/docs/api-reference/update-transactional-email)

#### Parameters

| Name                  | Type   | Required | Notes                                                    |
| --------------------- | ------ | -------- | -------------------------------------------------------- |
| `transactionalId`                  | string | Yes      | The ID of the transactional email.                       |
| `name`                | string | No       | The name of the transactional email.                     |
| `transactionalGroupId`| string | No       | The ID of the group to move this transactional email to. |

#### Example

```javascript
const resp = await loops.updateTransactionalEmail("cll42l54f20i1la0lfooe3z12", {
  name: "Updated name",
});

const resp = await loops.updateTransactionalEmail("cll42l54f20i1la0lfooe3z12", {
  transactionalGroupId: "clg7n5p3q1r9s7t5u3v1w9y7",
});
```

#### Response

```json
{
  "id": "cll42l54f20i1la0lfooe3z12",
  "url": "https://app.loops.so/transactional/cll42l54f20i1la0lfooe3z12",
  "name": "Updated name",
  "draftEmailMessageId": "cle5f7g9h1i3j5k7l9m1n3p5",
  "publishedEmailMessageId": "cle5f7g9h1i3j5k7l9m1n3p5",
  "transactionalGroupId": "clg7n5p3q1r9s7t5u3v1w9y7",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "dataVariables": [
    "confirmationUrl"
  ]
}
```

---

### ensureTransactionalEmailDraft()

Ensure a transactional email has a draft email message. Use [`updateEmailMessage()`](#updateemailmessage) to edit the draft content.

[API Reference](https://loops.so/docs/api-reference/ensure-transactional-draft)

#### Parameters

| Name | Type   | Required | Notes                              |
| ---- | ------ | -------- | ---------------------------------- |
| `transactionalId` | string | Yes      | The ID of the transactional email. |

#### Example

```javascript
const resp = await loops.ensureTransactionalEmailDraft("cll42l54f20i1la0lfooe3z12");
```

#### Response

```json
{
  "id": "cll42l54f20i1la0lfooe3z12",
  "url": "https://app.loops.so/transactional/cll42l54f20i1la0lfooe3z12",
  "name": "Sign up confirmation",
  "draftEmailMessageId": "cle5f7g9h1i3j5k7l9m1n3p5",
  "draftEmailMessageContentRevisionId": "clrev1s10n2i3d4e5f6g7h8",
  "publishedEmailMessageId": null,
  "transactionalGroupId": "clg7n5p3q1r9s7t5u3v1w9y7",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "dataVariables": []
}
```

---

### publishTransactionalEmail()

Publish a transactional email's current draft.

[API Reference](https://loops.so/docs/api-reference/publish-transactional-email)

#### Parameters

| Name | Type   | Required | Notes                              |
| ---- | ------ | -------- | ---------------------------------- |
| `transactionalId` | string | Yes      | The ID of the transactional email. |

#### Example

```javascript
const resp = await loops.publishTransactionalEmail("cll42l54f20i1la0lfooe3z12");
```

#### Response

```json
{
  "id": "cll42l54f20i1la0lfooe3z12",
  "url": "https://app.loops.so/transactional/cll42l54f20i1la0lfooe3z12",
  "name": "Sign up confirmation",
  "draftEmailMessageId": null,
  "publishedEmailMessageId": "cle5f7g9h1i3j5k7l9m1n3p5",
  "transactionalGroupId": "clg7n5p3q1r9s7t5u3v1w9y7",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "dataVariables": []
}
```

---

### listDedicatedSendingIps()

Get a list of Loops' dedicated sending IP addresses. This is intended for rare cases where you need to whitelist Loops' sending IPs.

[API Reference](https://loops.so/docs/api-reference/dedicated-sending-ips)

#### Parameters

None

#### Example

```javascript
const resp = await loops.listDedicatedSendingIps();
```

#### Response

```json
[
  "1.2.3.4",
  "5.6.7.8"
]
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### listThemes()

Retrieve a paginated list of email themes, most recently created first.
[API Reference](https://loops.so/docs/api-reference/list-themes)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listThemes();

const resp = await loops.listThemes({ perPage: 15, cursor: "clyo0q4wo01p59fsecyxqsh38" });
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "clo1z5q7s004yl70y3z4a5b6c",
      "name": "Default",
      "styles": {
        "backgroundColor": "#ffffff"
      },
      "isDefault": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### getTheme()

Retrieve a single theme by ID.
[API Reference](https://loops.so/docs/api-reference/get-theme)

#### Parameters

| Name | Type   | Required | Notes                |
| ---- | ------ | -------- | -------------------- |
| `themeId` | string | Yes      | The ID of the theme. |

#### Example

```javascript
const resp = await loops.getTheme("clo1z5q7s004yl70y3z4a5b6c");
```

#### Response

```json
{
  "id": "clo1z5q7s004yl70y3z4a5b6c",
  "name": "Default",
  "styles": {
    "backgroundColor": "#ffffff"
  },
  "isDefault": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### createTheme()

Create a new email theme.
[API Reference](https://loops.so/docs/api-reference/create-theme)

#### Parameters

| Name     | Type   | Required | Notes                              |
| -------- | ------ | -------- | ---------------------------------- |
| `name`   | string | Yes      | The theme name.                    |
| `styles` | object | No       | Style attributes for the theme.    |

#### Example

```javascript
const resp = await loops.createTheme({
  name: "Brand",
  styles: { backgroundColor: "#111111" },
});
```

#### Response

```json
{
  "id": "clt3u5v7w9x1y3z5a7b9c1d3",
  "name": "Brand",
  "styles": {
    "backgroundColor": "#111111"
  },
  "isDefault": false,
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z"
}
```

---

### updateTheme()

Update a theme's name and/or styles. When `styles` change, the update cascades to emails using the theme; `affectedEmailCount` reports how many were affected.
[API Reference](https://loops.so/docs/api-reference/update-theme)

#### Parameters

| Name     | Type   | Required | Notes                           |
| -------- | ------ | -------- | ------------------------------- |
| `themeId`     | string | Yes      | The ID of the theme.            |
| `name`   | string | No       | The theme name.                 |
| `styles` | object | No       | Style attributes for the theme. |

#### Example

```javascript
const resp = await loops.updateTheme("clt3u5v7w9x1y3z5a7b9c1d3", {
  name: "Brand Updated",
});
```

#### Response

```json
{
  "id": "clt3u5v7w9x1y3z5a7b9c1d3",
  "name": "Brand Updated",
  "styles": {
    "backgroundColor": "#111111"
  },
  "isDefault": false,
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "affectedEmailCount": 3
}
```

---

### listComponents()

Retrieve a paginated list of email components.
[API Reference](https://loops.so/docs/api-reference/list-components)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listComponents();

const resp = await loops.listComponents({ perPage: 15 });
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "clp2a6r8t005yl70d7e8f9g0h",
      "name": "Header",
      "lmx": "<Section>...</Section>"
    }
  ]
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### getComponent()

Retrieve a single component by ID.
[API Reference](https://loops.so/docs/api-reference/get-component)

#### Parameters

| Name | Type   | Required | Notes                     |
| ---- | ------ | -------- | ------------------------- |
| `componentId` | string | Yes      | The ID of the component. |

#### Example

```javascript
const resp = await loops.getComponent("clp2a6r8t005yl70d7e8f9g0h");
```

#### Response

```json
{
  "id": "clp2a6r8t005yl70d7e8f9g0h",
  "name": "Header",
  "lmx": "<Section>...</Section>"
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### createComponent()

Create a new email component.
[API Reference](https://loops.so/docs/api-reference/create-component)

#### Parameters

| Name   | Type   | Required | Notes                                 |
| ------ | ------ | -------- | ------------------------------------- |
| `name` | string | Yes      | The component name.                   |
| `lmx`  | string | Yes      | The component body as an LMX string.  |

#### Example

```javascript
const resp = await loops.createComponent({
  name: "Footer",
  lmx: "<Section>...</Section>",
});
```

#### Response

```json
{
  "id": "clp2a6r8t005yl70d7e8f9g0h",
  "name": "Footer",
  "lmx": "<Section>Footer content</Section>"
}
```

---

### updateComponent()

Update a component's name and/or LMX body. When `lmx` changes, the update cascades to emails using the component; `affectedEmailCount` reports how many were affected.
[API Reference](https://loops.so/docs/api-reference/update-component)

#### Parameters

| Name   | Type   | Required | Notes                                 |
| ------ | ------ | -------- | ------------------------------------- |
| `componentId`   | string | Yes      | The ID of the component.              |
| `name` | string | No       | The component name.                   |
| `lmx`  | string | No       | The component body as an LMX string.  |

#### Example

```javascript
const resp = await loops.updateComponent("clp2a6r8t005yl70d7e8f9g0h", {
  lmx: "<Section updated>...</Section>",
});
```

#### Response

```json
{
  "id": "clp2a6r8t005yl70d7e8f9g0h",
  "name": "Footer",
  "lmx": "<Section>Updated footer</Section>",
  "affectedEmailCount": 2
}
```

---

### listCampaigns()

Retrieve a paginated list of campaigns.
[API Reference](https://loops.so/docs/api-reference/list-campaigns)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listCampaigns();

const resp = await loops.listCampaigns({ perPage: 15 });
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "cln0y4p6r003yl70i1j2k3l4m",
      "url": "https://app.loops.so/campaigns/cln0y4p6r003yl70i1j2k3l4m",
      "emailMessageId": "clm9x3o5q002yl70a8b3c4d5e",
      "name": "Spring announcement",
      "status": "Draft",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "campaignGroupId": null,
      "mailingListId": null,
      "audienceSegmentId": null,
      "audienceFilter": null,
      "scheduling": {
        "method": "now",
        "timestamp": null
      }
    }
  ]
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### createCampaign()

Create a new draft campaign. An empty email message is created automatically and its `emailMessageId` is returned. Use [`updateEmailMessage()`](#updateemailmessage) to set subject, sender, preview text, and LMX content. The audience (mailing list, segment, or filter), group, and scheduling can be set on create or later via update.
[API Reference](https://loops.so/docs/api-reference/create-campaign)

#### Parameters

| Name                | Type    | Required | Notes                                                                                    |
| ------------------- | ------- | -------- | ---------------------------------------------------------------------------------------- |
| `name`              | string  | Yes      | The campaign name.                                                                       |
| `campaignGroupId`   | string  | No       | The ID of the group to add this campaign to.                                             |
| `mailingListId`     | string  | No       | The ID of the mailing list to send to.                                                   |
| `audienceSegmentId` | string  | No       | The ID of an audience segment. Setting this clears any `audienceFilter`.                 |
| `audienceFilter`    | object  | No       | An audience filter object. See the [API reference](https://loops.so/docs/api-reference/create-campaign). |
| `scheduling`        | object  | No       | When the campaign should send (`method`: `now` or `schedule`, with optional `timestamp`). |

#### Example

```javascript
const resp = await loops.createCampaign({ name: "Spring announcement" });

const resp = await loops.createCampaign({
  name: "Spring announcement",
  mailingListId: "cm06f5v0e45nf0ml5754o9cix",
  scheduling: { method: "schedule", timestamp: "2026-06-15T10:00:00.000Z" },
});
```

#### Response

```json
{
  "id": "cln0y4p6r003yl70i1j2k3l4m",
  "url": "https://app.loops.so/campaigns/cln0y4p6r003yl70i1j2k3l4m",
  "name": "Spring announcement",
  "status": "Draft",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "emailMessageId": "clm9x3o5q002yl70a8b3c4d5e",
  "emailMessageContentRevisionId": "clv8g2x4z012yl70n5o6p7q8r",
  "campaignGroupId": null,
  "mailingListId": null,
  "audienceSegmentId": null,
  "audienceFilter": null,
  "scheduling": {
    "method": "now",
    "timestamp": null
  }
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### getCampaign()

Retrieve a single campaign by ID.
[API Reference](https://loops.so/docs/api-reference/get-campaign)

#### Parameters

| Name | Type   | Required | Notes                   |
| ---- | ------ | -------- | ----------------------- |
| `campaignId` | string | Yes      | The ID of the campaign. |

#### Example

```javascript
const resp = await loops.getCampaign("cln0y4p6r003yl70i1j2k3l4m");
```

#### Response

```json
{
  "id": "cln0y4p6r003yl70i1j2k3l4m",
  "url": "https://app.loops.so/campaigns/cln0y4p6r003yl70i1j2k3l4m",
  "name": "Spring announcement",
  "status": "Draft",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "emailMessageId": "clm9x3o5q002yl70a8b3c4d5e",
  "campaignGroupId": null,
  "mailingListId": null,
  "audienceSegmentId": null,
  "audienceFilter": null,
  "scheduling": {
    "method": "now",
    "timestamp": null
  }
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### updateCampaign()

Update a draft campaign's name, group, audience, or scheduling. At least one field must be provided. Campaigns can only be updated while in draft status.
[API Reference](https://loops.so/docs/api-reference/update-campaign)

#### Parameters

| Name                | Type   | Required | Notes                                                                                    |
| ------------------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| `campaignId`                | string | Yes      | The ID of the campaign.                                                                  |
| `name`              | string | No       | The campaign name.                                                                       |
| `campaignGroupId`   | string | No       | The ID of the group to move this campaign to.                                            |
| `mailingListId`     | string | No       | The ID of the mailing list to send to.                                                   |
| `audienceSegmentId` | string | No       | The ID of an audience segment. Setting this clears any `audienceFilter`.                 |
| `audienceFilter`    | object | No       | An audience filter object.                                                               |
| `scheduling`        | object | No       | When the campaign should send. At least one field is required.                         |

#### Example

```javascript
const resp = await loops.updateCampaign("cln0y4p6r003yl70i1j2k3l4m", { name: "Updated name" });
```

#### Response

```json
{
  "id": "cln0y4p6r003yl70i1j2k3l4m",
  "url": "https://app.loops.so/campaigns/cln0y4p6r003yl70i1j2k3l4m",
  "name": "Updated name",
  "status": "Draft",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z",
  "emailMessageId": "clm9x3o5q002yl70a8b3c4d5e",
  "campaignGroupId": null,
  "mailingListId": null,
  "audienceSegmentId": null,
  "audienceFilter": null,
  "scheduling": {
    "method": "now",
    "timestamp": null
  }
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 409 Conflict
{
  "success": false,
  "message": "Campaign is not in draft status."
}
```

---

### getEmailMessage()

Retrieve an email message, including its compiled LMX content.
[API Reference](https://loops.so/docs/api-reference/get-email-message)

#### Parameters

| Name | Type   | Required | Notes                        |
| ---- | ------ | -------- | ---------------------------- |
| `emailMessageId` | string | Yes      | The ID of the email message. |

#### Example

```javascript
const resp = await loops.getEmailMessage("clm9x3o5q002yl70a8b3c4d5e");
```

#### Response

```json
{
  "id": "clm9x3o5q002yl70a8b3c4d5e",
  "campaignId": "cln0y4p6r003yl70i1j2k3l4m",
  "subject": "Hello",
  "previewText": "Preview text",
  "fromName": "Loops",
  "fromEmail": "hello",
  "replyToEmail": "",
  "emailFormat": "styled",
  "lmx": "<H1>...</H1><Paragraph>...</Paragraph>",
  "contentRevisionId": "clv8g2x4z012yl70n5o6p7q8r",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

---

### updateEmailMessage()

Update fields on an email message (subject, preview text, sender, LMX content). The campaign must be in draft status. Supply `expectedRevisionId` matching the current `contentRevisionId` — the server rejects mismatched revisions with 409.
[API Reference](https://loops.so/docs/api-reference/update-email-message)

#### Parameters

| Name                           | Type   | Required | Notes                                                                                                                                          |
| ------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `emailMessageId`                           | string | Yes      | The ID of the email message.                                                                                                                   |
| `expectedRevisionId`           | string | No       | The `contentRevisionId` you last fetched. Used for optimistic concurrency.                                                                     |
| `subject`                      | string | No       | The email subject.                                                                                                                             |
| `previewText`                  | string | No       | The email preview text.                                                                                                                        |
| `fromName`                     | string | No       | The sender name.                                                                                                                               |
| `fromEmail`                    | string | No       | The sender username (without `@` or domain). The team's sending domain is appended automatically.                                              |
| `replyToEmail`                 | string | No       | Reply-to email. Must be empty or a valid email address.                                                                                        |
| `ccEmail`                      | string | No       | CC email address. Requires CC/BCC to be enabled for your team.                                                                                |
| `bccEmail`                     | string | No       | BCC email address. Requires CC/BCC to be enabled for your team.                                                                               |
| `languageCode`                 | string | No       | Language code for the email. Requires translation to be enabled for your team.                                                                 |
| `emailFormat`                  | string | No       | The rendering format: `styled` or `plain`.                                                                                                   |
| `lmx`                          | string | No       | The email body serialized as LMX. Styles must be embedded in the LMX `<Style />` tag.                                                          |
| `contactPropertiesFallbacks`   | object | No       | Fallback values for contact properties, keyed by property name.                                                                                |
| `eventPropertiesFallbacks`     | object | No       | Fallback values for event properties, keyed by property name.                                                                                  |
| `dataVariablesFallbacks`       | object | No       | Fallback values for data variables, keyed by variable name.                                                                                    |

#### Example

```javascript
const resp = await loops.updateEmailMessage("clm9x3o5q002yl70a8b3c4d5e", {
  expectedRevisionId: "clv8g2x4z012yl70n5o6p7q8r",
  subject: "Hello",
  previewText: "Preview text",
  fromName: "Loops",
  fromEmail: "hello",
  lmx: "<H1>...</H1><Paragraph>...</Paragraph>",
});
```

#### Response

```json
{
  "id": "clm9x3o5q002yl70a8b3c4d5e",
  "campaignId": "cln0y4p6r003yl70i1j2k3l4m",
  "subject": "Hello",
  "previewText": "Preview text",
  "fromName": "Loops",
  "fromEmail": "hello",
  "replyToEmail": "",
  "emailFormat": "styled",
  "lmx": "<H1>...</H1><Paragraph>...</Paragraph>",
  "contentRevisionId": "clv8g2x4z013yl70s9t0u1v2w",
  "updatedAt": "2025-01-02T00:00:00.000Z",
  "warnings": [
    {
      "rule": "example",
      "severity": "warning",
      "message": "Example warning"
    }
  ]
}
```

Error handling is done through the `APIError` class, which provides `statusCode` and `json` properties containing the API's error response details. For implementation examples, see the [Usage section](#usage).

```json
HTTP 409 Conflict
{
  "success": false,
  "message": "Content revision ID is stale."
}
```

---

### listTransactionalGroups()

Retrieve a paginated list of transactional groups.
[API Reference](https://loops.so/docs/api-reference/list-transactional-groups)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listTransactionalGroups();
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "clg7n5p3q1r9s7t5u3v1w9y7",
      "name": "Onboarding",
      "description": "Transactional emails for new users",
      "createdAt": "2025-06-29T07:47:39.370Z",
      "updatedAt": "2025-06-29T07:47:39.370Z"
    }
  ]
}
```

---

### createTransactionalGroup()

Create a new transactional group.
[API Reference](https://loops.so/docs/api-reference/create-transactional-group)

#### Parameters

| Name          | Type   | Required | Notes                                  |
| ------------- | ------ | -------- | -------------------------------------- |
| `name`        | string | Yes      | The group name. Cannot be `"Unsorted"`. |
| `description` | string | No       | An optional description for the group. |

#### Example

```javascript
const resp = await loops.createTransactionalGroup({
  name: "Onboarding",
  description: "Transactional emails for new users",
});
```

#### Response

```json
{
  "id": "clg7n5p3q1r9s7t5u3v1w9y7",
  "name": "Onboarding",
  "description": "Transactional emails for new users",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z"
}
```

---

### getTransactionalGroup()

Retrieve a single transactional group by ID.
[API Reference](https://loops.so/docs/api-reference/get-transactional-group)

#### Parameters

| Name | Type   | Required | Notes                              |
| ---- | ------ | -------- | ---------------------------------- |
| `transactionalGroupId` | string | Yes      | The ID of the transactional group. |

#### Example

```javascript
const resp = await loops.getTransactionalGroup("clg7n5p3q1r9s7t5u3v1w9y7");
```

#### Response

```json
{
  "id": "clg7n5p3q1r9s7t5u3v1w9y7",
  "name": "Onboarding",
  "description": "Transactional emails for new users",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z"
}
```

---

### updateTransactionalGroup()

Update a transactional group's name or description. At least one field must be provided. The reserved `"Unsorted"` group cannot be edited.
[API Reference](https://loops.so/docs/api-reference/update-transactional-group)

#### Parameters

| Name          | Type   | Required | Notes                              |
| ------------- | ------ | -------- | ---------------------------------- |
| `transactionalGroupId`          | string | Yes      | The ID of the transactional group. |
| `name`        | string | No       | The group name.                    |
| `description` | string | No       | A description for the group.       |

#### Example

```javascript
const resp = await loops.updateTransactionalGroup("clg7n5p3q1r9s7t5u3v1w9y7", {
  name: "Updated name",
});
```

#### Response

```json
{
  "id": "clg7n5p3q1r9s7t5u3v1w9y7",
  "name": "Updated name",
  "description": "Transactional emails for new users",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z"
}
```

---

### listAudienceSegments()

Retrieve a paginated list of audience segments.
[API Reference](https://loops.so/docs/api-reference/list-audience-segments)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listAudienceSegments();
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "cls6e8g0i2k4m6o8q0s2u4w6",
      "name": "Power users",
      "description": "Contacts on the pro plan",
      "createdAt": "2025-06-29T07:47:39.370Z",
      "updatedAt": "2025-06-29T07:47:39.370Z",
      "filter": {
        "match": "all",
        "conditions": [
          {
            "type": "property",
            "key": "planName",
            "operator": "equals",
            "value": "pro"
          }
        ]
      }
    }
  ]
}
```

---

### getAudienceSegment()

Retrieve a single audience segment by ID.
[API Reference](https://loops.so/docs/api-reference/get-audience-segment)

#### Parameters

| Name | Type   | Required | Notes                            |
| ---- | ------ | -------- | -------------------------------- |
| `audienceSegmentId` | string | Yes      | The ID of the audience segment. |

#### Example

```javascript
const resp = await loops.getAudienceSegment("cls6e8g0i2k4m6o8q0s2u4w6");
```

#### Response

```json
{
  "id": "cls6e8g0i2k4m6o8q0s2u4w6",
  "name": "Power users",
  "description": "Contacts on the pro plan",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "filter": {
    "match": "all",
    "conditions": [
      {
        "type": "property",
        "key": "planName",
        "operator": "equals",
        "value": "pro"
      }
    ]
  }
}
```

---

### createAudienceSegment()

Create a new audience segment.
[API Reference](https://loops.so/docs/api-reference/create-audience-segment)

#### Parameters

| Name | Type | Required | Notes |
| ---- | ---- | -------- | ----- |
| `name` | string | Yes | The name of the audience segment. Must be unique within the team. |
| `description` | string | No | An optional description of the audience segment. |
| `filter` | object | Yes | A tree of audience conditions combined with `match` (`all` or `any`). |

#### Example

```javascript
const resp = await loops.createAudienceSegment({
  name: "Active users",
  description: "Contacts who opened a recent campaign",
  filter: {
    match: "all",
    conditions: [
      {
        type: "property",
        key: "planName",
        operator: "equals",
        value: "pro",
      },
    ],
  },
});
```

#### Response

```json
{
  "id": "cls6e8g0i2k4m6o8q0s2u4w6",
  "name": "Active users",
  "description": "Contacts who opened a recent campaign",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z",
  "filter": {
    "match": "all",
    "conditions": [
      {
        "type": "property",
        "key": "planName",
        "operator": "equals",
        "value": "pro"
      }
    ]
  }
}
```

---

### listCampaignGroups()

Retrieve a paginated list of campaign groups.
[API Reference](https://loops.so/docs/api-reference/list-campaign-groups)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listCampaignGroups();
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "clq3b7s9u007yl70u9v0w1x2y",
      "description": "Monthly product updates",
      "createdAt": "2025-06-29T07:47:39.370Z",
      "updatedAt": "2025-06-29T07:47:39.370Z"
    }
  ]
}
```

---

### createCampaignGroup()

Create a new campaign group.
[API Reference](https://loops.so/docs/api-reference/create-campaign-group)

#### Parameters

| Name          | Type   | Required | Notes                                  |
| ------------- | ------ | -------- | -------------------------------------- |
| `name`        | string | Yes      | The group name. Cannot be `"Unsorted"`. |
| `description` | string | No       | An optional description for the group. |

#### Example

```javascript
const resp = await loops.createCampaignGroup({
  name: "Newsletters",
});
```

#### Response

```json
{
  "id": "clq3b7s9u007yl70u9v0w1x2y",
  "name": "Newsletters",
  "description": "",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z"
}
```

---

### getCampaignGroup()

Retrieve a single campaign group by ID.
[API Reference](https://loops.so/docs/api-reference/get-campaign-group)

#### Parameters

| Name | Type   | Required | Notes                         |
| ---- | ------ | -------- | ----------------------------- |
| `campaignGroupId` | string | Yes      | The ID of the campaign group. |

#### Example

```javascript
const resp = await loops.getCampaignGroup("clq3b7s9u007yl70u9v0w1x2y");
```

#### Response

```json
{
  "id": "clq3b7s9u007yl70u9v0w1x2y",
  "name": "Newsletters",
  "description": "Monthly product updates",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z"
}
```

---

### updateCampaignGroup()

Update a campaign group's name or description. At least one field must be provided. The reserved `"Unsorted"` group cannot be edited.
[API Reference](https://loops.so/docs/api-reference/update-campaign-group)

#### Parameters

| Name          | Type   | Required | Notes                         |
| ------------- | ------ | -------- | ----------------------------- |
| `campaignGroupId`          | string | Yes      | The ID of the campaign group. |
| `name`        | string | No       | The group name.               |
| `description` | string | No       | A description for the group.  |

#### Example

```javascript
const resp = await loops.updateCampaignGroup("clq3b7s9u007yl70u9v0w1x2y", {
  description: "Monthly product updates",
});
```

#### Response

```json
{
  "id": "clq3b7s9u007yl70u9v0w1x2y",
  "name": "Newsletters",
  "description": "Monthly product updates",
  "createdAt": "2025-06-29T07:47:39.370Z",
  "updatedAt": "2025-06-29T07:47:39.370Z"
}
```

---

### sendEmailMessagePreview()

Send a test preview of an email message to one or more addresses.
[API Reference](https://loops.so/docs/api-reference/preview-email-message)

#### Parameters

| Name                | Type     | Required | Notes                                                                                       |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `emailMessageId`                | string   | Yes      | The ID of the email message.                                                                |
| `emails`            | string[] | Yes      | One or more addresses to send the preview to.                                               |
| `contactProperties` | object   | No       | Contact property values to render. Accepted for campaign and workflow previews.             |
| `eventProperties`   | object   | No       | Event property values to render. Accepted for workflow previews only.                       |
| `dataVariables`     | object   | No       | Transactional data variables to render. Accepted for transactional previews only.           |

#### Example

```javascript
const resp = await loops.sendEmailMessagePreview("clm9x3o5q002yl70a8b3c4d5e", {
  emails: ["test@example.com"],
  contactProperties: {
    firstName: "Alex",
  },
});
```

#### Response

```json
{
  "id": "clm9x3o5q002yl70a8b3c4d5e"
}
```

---

### runEmailMessageGuardian()

Validate an email message against Guardian rules. Errors must be resolved before publishing; warnings are advisory.
[API Reference](https://loops.so/docs/api-reference/run-guardian-checks)

#### Parameters

| Name | Type   | Required | Notes                          |
| ---- | ------ | -------- | ------------------------------ |
| `emailMessageId` | string | Yes      | The ID of the email message.   |

#### Example

```javascript
const resp = await loops.runEmailMessageGuardian("clm9x3o5q002yl70a8b3c4d5e");
```

#### Response

```json
{
  "errors": [
    {
      "rule": "missingButtonHrefs",
      "title": "Missing button link",
      "description": "Buttons won't work without href value",
      "items": [
        {
          "label": "Click here"
        }
      ]
    },
    {
      "rule": "missingLinkHrefs",
      "title": "Missing text link",
      "description": "Links won't work without href value",
      "items": [
        {
          "label": "See more"
        }
      ]
    }
  ],
  "warnings": []
}
```

---

### listEventPatterns()

Retrieve a paginated list of event patterns available to workflow event trigger nodes.
[API Reference](https://loops.so/docs/api-reference/list-event-patterns)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listEventPatterns();
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "cle1a2b3c004yl70d5e6f7g8h",
      "eventName": "signup",
      "incomingWebhookPlatform": null
    }
  ]
}
```

---

### getEventPattern()

Retrieve event pattern details by ID.
[API Reference](https://loops.so/docs/api-reference/get-event-pattern)

#### Parameters

| Name | Type   | Required | Notes                        |
| ---- | ------ | -------- | ---------------------------- |
| `eventPatternId` | string | Yes      | The ID of the event pattern. |

#### Example

```javascript
const resp = await loops.getEventPattern("cle1a2b3c004yl70d5e6f7g8h");
```

#### Response

```json
{
  "id": "cle1a2b3c004yl70d5e6f7g8h",
  "eventName": "signup",
  "eventProperties": [
    {
      "name": "plan",
      "type": "string"
    },
    {
      "name": "trialDays",
      "type": "number"
    }
  ],
  "incomingWebhookPlatform": null
}
```

---

### getEventPatternByName()

Retrieve event pattern details by event name.
[API Reference](https://loops.so/docs/api-reference/get-event-pattern-by-name)

#### Parameters

| Name       | Type   | Required | Notes                          |
| ---------- | ------ | -------- | ------------------------------ |
| `eventName` | string | Yes      | The name of the event pattern. |

#### Example

```javascript
const resp = await loops.getEventPatternByName("signup");
```

#### Response

```json
{
  "id": "cle1a2b3c004yl70d5e6f7g8h",
  "eventName": "signup",
  "eventProperties": [
    {
      "name": "plan",
      "type": "string"
    },
    {
      "name": "trialDays",
      "type": "number"
    }
  ],
  "incomingWebhookPlatform": null
}
```

---

### listWorkflows()

Retrieve a paginated list of workflows.
[API Reference](https://loops.so/docs/api-reference/list-workflows)

#### Parameters

| Name      | Type    | Required | Notes                                                                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `perPage` | integer | No       | How many results to return per page. Must be between 10 and 50. Defaults to 20 if omitted.                                    |
| `cursor`  | string  | No       | A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response. |

#### Example

```javascript
const resp = await loops.listWorkflows();
```

#### Response

```json
{
  "pagination": {
    "totalResults": 1,
    "returnedResults": 1,
    "perPage": 20,
    "totalPages": 1,
    "nextCursor": null,
    "nextPage": null
  },
  "data": [
    {
      "id": "clw1a3b5c7d9e1f3g5h7i9j1",
      "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
      "name": "Onboarding",
      "createdAt": "2025-06-29T07:47:39.370Z",
      "updatedAt": "2025-06-29T07:47:39.370Z"
    }
  ]
}
```

---

### createWorkflow()

Create a draft workflow with a blank trigger and exit node.
[API Reference](https://loops.so/docs/api-reference/create-workflow)

#### Parameters

| Name            | Type           | Required | Notes                                              |
| --------------- | -------------- | -------- | -------------------------------------------------- |
| `name`          | string         | Yes      | The name of the workflow.                          |
| `description`   | string         | No       | The description of the workflow.                   |
| `mailingListId` | string \| null | No       | The ID of a mailing list the workflow sends to.    |

#### Example

```javascript
const resp = await loops.createWorkflow({ name: "Onboarding" });
```

#### Response

```json
{
  "id": "clw1a3b5c7d9e1f3g5h7i9j1",
  "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
  "status": "Draft",
  "name": "Onboarding",
  "mailingListId": null,
  "rootNodeId": "cf16k73gq014h3mmj5b6jdi9r",
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "nodes": {
    "cf16k73gq014h3mmj5b6jdi9r": {
      "typeName": "BlankTrigger",
      "nextNodeIds": [
        "cf16k73gq014h3mmj5b4jdifg"
      ]
    },
    "cf16k73gq014h3mmj5b4jdifg": {
      "typeName": "ExitAction",
      "nextNodeIds": []
    }
  }
}
```

---

### getWorkflow()

Retrieve a workflow graph with node type names, connections, and selected display fields. Includes `workflowRevisionId` (may be `null` for older workflows) for subsequent mutations.
[API Reference](https://loops.so/docs/api-reference/get-workflow)

#### Parameters

| Name | Type   | Required | Notes                    |
| ---- | ------ | -------- | ------------------------ |
| `workflowId` | string | Yes      | The ID of the workflow. |

#### Example

```javascript
const resp = await loops.getWorkflow("clw1a3b5c7d9e1f3g5h7i9j1");
```

#### Response

```json
{
  "id": "clw1a3b5c7d9e1f3g5h7i9j1",
  "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
  "status": "Draft",
  "name": "Onboarding",
  "mailingListId": null,
  "rootNodeId": "cf16k73gq014h3mmj5b6jdi9r",
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "nodes": {
    "cf16k73gq014h3mmj5b6jdi9r": {
      "typeName": "SignupTrigger",
      "nextNodeIds": [
        "cf16k73gq014h3mmj5b4jdifg"
      ]
    },
    "cf16k73gq014h3mmj5b4jdifg": {
      "typeName": "ExitAction",
      "nextNodeIds": []
    }
  }
}
```

---

### updateWorkflow()

Update a workflow's name and/or description. To change the mailing list, use [`changeWorkflowMailingList()`](#changeworkflowmailinglist).
[API Reference](https://loops.so/docs/api-reference/update-workflow)

#### Parameters

| Name                 | Type   | Required | Notes                                                              |
| -------------------- | ------ | -------- | ------------------------------------------------------------------ |
| `workflowId`                 | string | Yes      | The ID of the workflow.                                            |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `name`               | string | No       | The updated workflow name.                                         |
| `description`        | string | No       | The updated workflow description.                                  |

#### Example

```javascript
const resp = await loops.updateWorkflow("clw1a3b5c7d9e1f3g5h7i9j1", {
  expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8",
  name: "Updated onboarding",
});
```

#### Response

```json
{
  "id": "clw1a3b5c7d9e1f3g5h7i9j1",
  "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
  "status": "Draft",
  "name": "Updated onboarding",
  "mailingListId": null,
  "rootNodeId": "cf16k73gq014h3mmj5b6jdi9r",
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "nodes": {
    "cf16k73gq014h3mmj5b6jdi9r": {
      "typeName": "BlankTrigger",
      "nextNodeIds": [
        "cf16k73gq014h3mmj5b4jdifg"
      ]
    },
    "cf16k73gq014h3mmj5b4jdifg": {
      "typeName": "ExitAction",
      "nextNodeIds": []
    }
  }
}
```

---

### deleteWorkflow()

Delete a workflow. Successful deletion returns no content. If the workflow is currently sending or has queued contacts, Loops returns `409 Conflict` instead of deleting; retry with `confirmDelete: true` to delete the workflow, stop sending, and cancel queued contacts.

Note: Once deleted, workflows are not returned in other API endpoints.

[API Reference](https://loops.so/docs/api-reference/delete-workflow)

#### Parameters

| Name                 | Type           | Required | Notes                                                              |
| -------------------- | -------------- | -------- | ------------------------------------------------------------------ |
| `workflowId`         | string         | Yes      | The ID of the workflow.                                            |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `confirmDelete`      | boolean        | No       | Set to `true` after a confirmation-required `409 Conflict` to confirm deletion. |

#### Example

```javascript
await loops.deleteWorkflow("clw1a3b5c7d9e1f3g5h7i9j1", {
  expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8",
});

await loops.deleteWorkflow("clw1a3b5c7d9e1f3g5h7i9j1", {
  expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8",
  confirmDelete: true,
});
```

#### Response

Successful deletion returns no content (`204 No Content`).

---

### changeWorkflowMailingList()

Dry run or apply a workflow mailing list change. If queued contacts would be removed, the response status is `queuedContactsFound`; retry with `queuedContactPolicy: "discard"` to apply.
[API Reference](https://loops.so/docs/api-reference/change-workflow-mailing-list)

#### Parameters

| Name                 | Type               | Required | Notes                                                              |
| -------------------- | ------------------ | -------- | ------------------------------------------------------------------ |
| `workflowId`                 | string             | Yes      | The ID of the workflow.                                            |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `mailingListId`      | string \| null     | Yes      | The mailing list to use, or `null` to clear it.                    |
| `dryRun`             | boolean            | No       | If `true`, validate without modifying the workflow.                |
| `queuedContactPolicy`| `"fail"` \| `"discard"` | No  | How to handle queued contacts that would be removed.               |

#### Example

```javascript
const resp = await loops.changeWorkflowMailingList("clw1a3b5c7d9e1f3g5h7i9j1", {
  expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8",
  mailingListId: "clm1a2b3c004yl70d5e6f7g8h",
});
```

#### Response

```json
{
  "status": "updated",
  "mailingListId": "clm1a2b3c004yl70d5e6f7g8h",
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "queuedContactCount": 0,
  "workflow": {
    "id": "clw1a3b5c7d9e1f3g5h7i9j1",
    "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
    "status": "Draft",
    "name": "Onboarding",
    "mailingListId": "clm1a2b3c004yl70d5e6f7g8h",
    "rootNodeId": "clt6e0v2x010yl70h1i2j3k4l",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
    "nodes": {}
  }
}
```

---

### createWorkflowNode()

Create a new default workflow node. Use `insertMode: "between"`, `insertMode: "before"` (with `toNodeId`), or `insertMode: "after"`, then configure with [`updateWorkflowNode()`](#updateworkflownode).
[API Reference](https://loops.so/docs/api-reference/create-workflow-node)

#### Parameters

| Name                 | Type   | Required | Notes                                                                 |
| -------------------- | ------ | -------- | --------------------------------------------------------------------- |
| `workflowId`                 | string | Yes      | The ID of the workflow.                                               |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `insertMode`         | string | Yes      | `"between"`, `"before"`, or `"after"`.                                |
| `nodeTypeName`       | string | Yes      | Node type to create (for example `TimerAction`, `AudienceFilter`).    |
| `fromNodeId`         | string | Cond.    | Required when `insertMode` is `"between"` or `"after"`. For `"after"`, the source must have exactly one outgoing node. |
| `toNodeId`           | string | Cond.    | Required when `insertMode` is `"between"` or `"before"`.              |
| `beforeNodeId`       | string | Cond.    | Deprecated. Use `toNodeId` with `insertMode: "before"`.               |

#### Example

```javascript
const resp = await loops.createWorkflowNode("clw1a3b5c7d9e1f3g5h7i9j1", {
  expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8",
  insertMode: "between",
  nodeTypeName: "TimerAction",
  fromNodeId: "clt6e0v2x010yl70h1i2j3k4l",
  toNodeId: "clu7f1w3y011yl70m5n6o7p8q",
});
```

#### Response

```json
{
  "node": {
    "id": "cln8p0q2r4s6t8u0v2w4x6z8",
    "workflowId": "clw1a3b5c7d9e1f3g5h7i9j1",
    "typeName": "TimerAction",
    "nextNodeIds": [
      "clu7f1w3y011yl70m5n6o7p8q"
    ],
    "amount": 0,
    "unit": "m",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6"
  },
  "workflow": {
    "id": "clw1a3b5c7d9e1f3g5h7i9j1",
    "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
    "status": "Draft",
    "name": "Onboarding",
    "mailingListId": null,
    "rootNodeId": "clt6e0v2x010yl70h1i2j3k4l",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
    "nodes": {
      "clt6e0v2x010yl70h1i2j3k4l": {
        "typeName": "BlankTrigger",
        "nextNodeIds": [
          "cln8p0q2r4s6t8u0v2w4x6z8"
        ]
      },
      "cln8p0q2r4s6t8u0v2w4x6z8": {
        "typeName": "TimerAction",
        "nextNodeIds": [
          "clu7f1w3y011yl70m5n6o7p8q"
        ],
        "amount": 0,
        "unit": "m"
      },
      "clu7f1w3y011yl70m5n6o7p8q": {
        "typeName": "ExitAction",
        "nextNodeIds": []
      }
    }
  }
}
```

---

### getWorkflowNode()

Retrieve detailed data for a single workflow node. Includes `workflowRevisionId` (may be `null` for older workflows).
[API Reference](https://loops.so/docs/api-reference/get-workflow-node)

#### Parameters

| Name         | Type   | Required | Notes                        |
| ------------ | ------ | -------- | ---------------------------- |
| `workflowId` | string | Yes      | The ID of the workflow.      |
| `nodeId`         | string | Yes      | The ID of the workflow node. |

#### Example

```javascript
const resp = await loops.getWorkflowNode("clw1a3b5c7d9e1f3g5h7i9j1", "cln8p0q2r4s6t8u0v2w4x6z8");
```

#### Response

```json
{
  "id": "cln8p0q2r4s6t8u0v2w4x6z8",
  "workflowId": "clw1a3b5c7d9e1f3g5h7i9j1",
  "typeName": "TimerAction",
  "nextNodeIds": [
    "cf16k73gq014h3mmj5b4jdifg"
  ],
  "amount": 1,
  "unit": "h",
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6"
}
```

---

### updateWorkflowNode()

Update workflow-node-owned fields for a single node.
[API Reference](https://loops.so/docs/api-reference/update-workflow-node)

#### Parameters

| Name                 | Type   | Required | Notes                                                              |
| -------------------- | ------ | -------- | ------------------------------------------------------------------ |
| `workflowId`                 | string | Yes      | The ID of the workflow.                                            |
| `nodeId`                 | string | Yes      | The ID of the workflow node.                                       |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `payload`            | object | Yes      | Node-type-specific fields to update.                               |

#### Example

```javascript
const resp = await loops.updateWorkflowNode(
  "clw1a3b5c7d9e1f3g5h7i9j1",
  "cln8p0q2r4s6t8u0v2w4x6z8",
  {
    expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8",
    payload: { amount: 1, unit: "h" },
  }
);
```

#### Response

```json
{
  "id": "cln8p0q2r4s6t8u0v2w4x6z8",
  "workflowId": "clw1a3b5c7d9e1f3g5h7i9j1",
  "typeName": "TimerAction",
  "nextNodeIds": [
    "cf16k73gq014h3mmj5b4jdifg"
  ],
  "amount": 1,
  "unit": "h",
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "workflow": {
    "id": "clw1a3b5c7d9e1f3g5h7i9j1",
    "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
    "status": "Draft",
    "name": "Onboarding",
    "mailingListId": null,
    "rootNodeId": "clt6e0v2x010yl70h1i2j3k4l",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
    "nodes": {}
  }
}
```

---

### deleteWorkflowNode()

Delete a single workflow node. If contacts are queued, the response status is `queuedContactsFound`; retry with `queuedContactPolicy: "discard"`.
[API Reference](https://loops.so/docs/api-reference/delete-workflow-node)

#### Parameters

| Name                 | Type               | Required | Notes                                                              |
| -------------------- | ------------------ | -------- | ------------------------------------------------------------------ |
| `workflowId`                 | string             | Yes      | The ID of the workflow.                                            |
| `nodeId`                 | string             | Yes      | The ID of the workflow node.                                       |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `dryRun`             | boolean            | No       | If `true`, validate without modifying the workflow.                |
| `queuedContactPolicy`| `"fail"` \| `"discard"` | No  | How to handle queued contacts.                                     |

#### Example

```javascript
const resp = await loops.deleteWorkflowNode(
  "clw1a3b5c7d9e1f3g5h7i9j1",
  "cln8p0q2r4s6t8u0v2w4x6z8",
  { expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8" }
);
```

#### Response

```json
{
  "status": "deleted",
  "nodeIds": [
    "cln8p0q2r4s6t8u0v2w4x6z8"
  ],
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "queuedContactCount": 0,
  "workflow": {
    "id": "clw1a3b5c7d9e1f3g5h7i9j1",
    "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
    "status": "Draft",
    "name": "Onboarding",
    "mailingListId": null,
    "rootNodeId": "clt6e0v2x010yl70h1i2j3k4l",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
    "nodes": {}
  }
}
```

---

### addWorkflowBranch()

Add a branch and a child node under an existing Branch or Experiment node.
[API Reference](https://loops.so/docs/api-reference/add-workflow-branch)

#### Parameters

| Name                 | Type   | Required | Notes                                                              |
| -------------------- | ------ | -------- | ------------------------------------------------------------------ |
| `workflowId`                 | string | Yes      | The ID of the workflow.                                            |
| `nodeId`                 | string | Yes      | The ID of the Branch or Experiment node.                           |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |

#### Example

```javascript
const resp = await loops.addWorkflowBranch(
  "clw1a3b5c7d9e1f3g5h7i9j1",
  "clt6e0v2x010yl70h1i2j3k4l",
  { expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8" }
);
```

#### Response

```json
{
  "node": {
    "id": "cln0a2b4c6d8e0f2g4h6i8j0",
    "workflowId": "clw1a3b5c7d9e1f3g5h7i9j1",
    "typeName": "AudienceFilter",
    "nextNodeIds": [],
    "audienceSegmentId": null,
    "audienceFilter": null,
    "appliesDownstream": false,
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6"
  },
  "workflow": {
    "id": "clw1a3b5c7d9e1f3g5h7i9j1",
    "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
    "status": "Draft",
    "name": "Onboarding",
    "mailingListId": null,
    "rootNodeId": "clt6e0v2x010yl70h1i2j3k4l",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
    "nodes": {
      "clt6e0v2x010yl70h1i2j3k4l": {
        "typeName": "BranchNode",
        "nextNodeIds": [
          "cln0a2b4c6d8e0f2g4h6i8j0"
        ]
      },
      "cln0a2b4c6d8e0f2g4h6i8j0": {
        "typeName": "AudienceFilter",
        "nextNodeIds": []
      }
    }
  }
}
```

---

### rerouteWorkflowNode()

Reroute a source node's single outgoing connection to another valid target node. The source must have exactly one outgoing connection (branch/experiment nodes are not supported).
[API Reference](https://loops.so/docs/api-reference/reroute-node-connection)

#### Parameters

| Name                 | Type   | Required | Notes                                                              |
| -------------------- | ------ | -------- | ------------------------------------------------------------------ |
| `workflowId`                 | string | Yes      | The ID of the workflow.                                            |
| `nodeId`                 | string | Yes      | The ID of the source workflow node.                                |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `newTargetNodeId`    | string | Yes      | The node that should receive the connection.                       |

#### Example

```javascript
const resp = await loops.rerouteWorkflowNode(
  "clw1a3b5c7d9e1f3g5h7i9j1",
  "cln8p0q2r4s6t8u0v2w4x6z8",
  {
    expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8",
    newTargetNodeId: "clu7f1w3y011yl70m5n6o7p8q",
  }
);
```

#### Response

```json
{
  "id": "cln8p0q2r4s6t8u0v2w4x6z8",
  "workflowId": "clw1a3b5c7d9e1f3g5h7i9j1",
  "typeName": "SignupTrigger",
  "nextNodeIds": [
    "clu7f1w3y011yl70m5n6o7p8q"
  ],
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "workflow": {
    "id": "clw1a3b5c7d9e1f3g5h7i9j1",
    "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
    "status": "Draft",
    "name": "Onboarding",
    "mailingListId": null,
    "rootNodeId": "cln8p0q2r4s6t8u0v2w4x6z8",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
    "nodes": {}
  }
}
```

---

### deleteWorkflowNodesRecursive()

Delete a node and its downstream subtree. If contacts are queued, the response status is `queuedContactsFound`; retry with `queuedContactPolicy: "discard"`.
[API Reference](https://loops.so/docs/api-reference/delete-workflow-nodes)

#### Parameters

| Name                 | Type               | Required | Notes                                                              |
| -------------------- | ------------------ | -------- | ------------------------------------------------------------------ |
| `workflowId`                 | string             | Yes      | The ID of the workflow.                                            |
| `nodeId`                 | string             | Yes      | The ID of the workflow node.                                       |
| `expectedRevisionId` | string \| null | Yes      | The workflow revision token from the latest read or mutation. Pass `null` for workflows that do not have a revision yet. |
| `dryRun`             | boolean            | No       | If `true`, validate without modifying the workflow.                |
| `queuedContactPolicy`| `"fail"` \| `"discard"` | No  | How to handle queued contacts.                                     |

#### Example

```javascript
const resp = await loops.deleteWorkflowNodesRecursive(
  "clw1a3b5c7d9e1f3g5h7i9j1",
  "clt6e0v2x010yl70h1i2j3k4l",
  { expectedRevisionId: "clrev1s10n2i3d4e5f6g7h8", queuedContactPolicy: "discard" }
);
```

#### Response

```json
{
  "status": "deleted",
  "nodeIds": [
    "cln8p0q2r4s6t8u0v2w4x6z8",
    "cln9q1r3s5t7u9v1w3x5y7z9"
  ],
  "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
  "queuedContactCount": 0,
  "workflow": {
    "id": "clw1a3b5c7d9e1f3g5h7i9j1",
    "url": "https://app.loops.so/workflows/clw1a3b5c7d9e1f3g5h7i9j1",
    "status": "Draft",
    "name": "Onboarding",
    "mailingListId": null,
    "rootNodeId": "clt6e0v2x010yl70h1i2j3k4l",
    "workflowRevisionId": "clrev0w0r1k2f3l4o5w6",
    "nodes": {}
  }
}
```

---

### createUpload()

Request a pre-signed URL to upload an image asset. Upload the file with an HTTP `PUT` to the returned `presignedUrl`, then call [`completeUpload()`](#completeupload).

[API Reference](https://loops.so/docs/api-reference/create-upload)

#### Parameters

| Name            | Type    | Required | Notes                                                                                      |
| --------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `contentType`   | string  | Yes      | MIME type (`image/jpeg`, `image/png`, `image/gif`, or `image/webp`).                       |
| `contentLength` | integer | Yes      | File size in bytes. Must be a positive integer no greater than 4,000,000 bytes.            |

#### Example

```javascript
const resp = await loops.createUpload({
  contentType: "image/png",
  contentLength: 102400,
});
```

#### Response

```json
{
  "emailAssetId": "cla3s5s7e9t1i3d5f7g9h1j3",
  "presignedUrl": "https://loops-assets.s3.amazonaws.com/uploads/cla3s5s7e9t1i3d5f7g9h1j3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
}
```

---

### completeUpload()

Finalize an asset after the file has been uploaded to the pre-signed URL.

[API Reference](https://loops.so/docs/api-reference/complete-upload)

#### Parameters

| Name | Type   | Required | Notes                                                      |
| ---- | ------ | -------- | ---------------------------------------------------------- |
| `id` | string | Yes      | The `emailAssetId` returned from [`createUpload()`](#createupload). |

#### Example

```javascript
const resp = await loops.completeUpload("cla3s5s7e9t1i3d5f7g9h1j3");
```

#### Response

```json
{
  "emailAssetId": "cla3s5s7e9t1i3d5f7g9h1j3",
  "finalUrl": "https://assets.loops.so/cla3s5s7e9t1i3d5f7g9h1j3/logo.png"
}
```

---

## Version history

- `v7.3.0` (Sep 1, 2026)
  - Aligned with OpenAPI 1.21.9.
  - Added [`deleteWorkflow()`](#deleteworkflow).
  - Campaign, transactional email, and workflow responses now include a `url` field pointing to the resource in the Loops app.
- `v7.2.0` (Aug 7, 2026)
  - Aligned with OpenAPI 1.21.6.
  - Added [`rerouteWorkflowNode()`](#rerouteworkflownode).
  - Added `insertMode: "after"` for [`createWorkflowNode()`](#createworkflownode); `before` mode now prefers `toNodeId` (`beforeNodeId` remains as a deprecated alias).
  - Mutation responses for mailing-list changes, node updates, and node deletes now include the latest `workflow`.
  - Removed `queuedContactLimitReached` from workflow mutation responses.
- `v7.1.0` (Aug 3, 2026)
  - Added event patterns ([`listEventPatterns()`](#listeventpatterns), [`getEventPattern()`](#geteventpattern), [`getEventPatternByName()`](#geteventpatternbyname)).
  - Expanded workflows with create/update/mutate APIs ([`createWorkflow()`](#createworkflow), [`updateWorkflow()`](#updateworkflow), [`changeWorkflowMailingList()`](#changeworkflowmailinglist), [`createWorkflowNode()`](#createworkflownode), [`updateWorkflowNode()`](#updateworkflownode), [`deleteWorkflowNode()`](#deleteworkflownode), [`addWorkflowBranch()`](#addworkflowbranch), [`deleteWorkflowNodesRecursive()`](#deleteworkflownodesrecursive)).
  - Added theme and component write APIs ([`createTheme()`](#createtheme), [`updateTheme()`](#updatetheme), [`createComponent()`](#createcomponent), [`updateComponent()`](#updatecomponent)).
  - Added [`createAudienceSegment()`](#createaudiencesegment).
  - Added [`runEmailMessageGuardian()`](#runemailmessageguardian).
  - Aligned workflow response types with the API (`status`, nullable `workflowRevisionId`; removed unused `emoji`).
- `v7.0.0` (Jun 24, 2026)
  - Added transactional email management ([`getTransactionalEmail()`](#gettransactionalemail), [`createTransactionalEmail()`](#createtransactionalemail), [`updateTransactionalEmail()`](#updatetransactionalemail), [`ensureTransactionalEmailDraft()`](#ensuretransactionalemaildraft), [`publishTransactionalEmail()`](#publishtransactionalemail)).
  - Added workflows ([`listWorkflows()`](#listworkflows), [`getWorkflow()`](#getworkflow), [`getWorkflowNode()`](#getworkflownode)).
  - Added image uploads ([`createUpload()`](#createupload), [`completeUpload()`](#completeupload)).
  - Added audience segments ([`listAudienceSegments()`](#listaudiencesegments), [`getAudienceSegment()`](#getaudiencesegment)).
  - Added campaign groups ([`listCampaignGroups()`](#listcampaigngroups), [`createCampaignGroup()`](#createcampaigngroup), [`getCampaignGroup()`](#getcampaigngroup), [`updateCampaignGroup()`](#updatecampaigngroup)).
  - Added transactional groups ([`listTransactionalGroups()`](#listtransactionalgroups), [`createTransactionalGroup()`](#createtransactionalgroup), [`getTransactionalGroup()`](#gettransactionalgroup), [`updateTransactionalGroup()`](#updatetransactionalgroup)).
  - Added [`sendEmailMessagePreview()`](#sendemailmessagepreview).
  - Expanded [`createCampaign()`](#createcampaign) and [`updateCampaign()`](#updatecampaign) with group, audience, and scheduling options.
  - Expanded [`createTransactionalEmail()`](#createtransactionalemail) and [`updateTransactionalEmail()`](#updatetransactionalemail) with `transactionalGroupId`.
  - Expanded [`updateEmailMessage()`](#updateemailmessage) with `ccEmail`, `bccEmail`, `languageCode`, `emailFormat`, and property fallback maps.
  - Renamed list methods to use a consistent `list` naming pattern (breaking change): [`listContactProperties()`](#listcontactproperties), [`listMailingLists()`](#listmailinglists), [`listTransactionalEmails()`](#listtransactionalemails), [`listDedicatedSendingIps()`](#listdedicatedsendingips), [`listThemes()`](#listthemes), [`listComponents()`](#listcomponents), and [`listCampaigns()`](#listcampaigns). Note `getCustomProperties` is now `listContactProperties`.
  - [`listTransactionalEmails()`](#listtransactionalemails) uses a new underlying API endpoint and returns an updated response shape (including `transactionalGroupId`).
  - Breaking change: API response objects now use `id` instead of `campaignId`, `themeId`, `componentId`, and `emailMessageId`. List and detail responses no longer include a top-level `success` field.
- `v6.4.0` (May 18, 2026) - Added `getDedicatedSendingIps()`, and endpoints for creating and editing campaings (`getThemes()`, [`getTheme()`](#gettheme), `getComponents()`, [`getComponent()`](#getcomponent), `getCampaigns()`, [`createCampaign()`](#createcampaign), [`getCampaign()`](#getcampaign), [`updateCampaign()`](#updatecampaign), [`getEmailMessage()`](#getemailmessage), and [`updateEmailMessage()`](#updateemailmessage)).
- `v6.3.0` (Apr 8, 2026) - Added [`checkContactSuppression()`](#checkcontactsuppression) and [`removeContactSuppression()`](#removecontactsuppression) methods.
- `v6.2.0` (Feb 9, 2026) - Support for the new arrays feature in sendTransactionalEmail.
- `v6.1.2` (Jan 29, 2026) - Added `rawBody` to `APIError` in the case no JSON is received from the server (thanks to [@leipert](https://github.com/leipert)).
- `v6.0.1` (Oct 15, 2025) - Added `optInStatus` to contact object in [`findContact()`](#findcontact) for the new double opt-in feature.
- `v6.0.0` (Aug 22, 2025) - [`createContact()`](#createcontact) and [`updateContact()`](#updatecontact) now have a single object parameter instead of named parameters (breaking change). This allows support for using either `email` or `userId` when updating contacts.
- `v5.0.1` (May 13, 2025) - Added a `headers` parameter for [`sendEvent()`](#sendevent) and [`sendTransactionalEmail()`](#sendtransactionalemail), enabling support for the `Idempotency-Key` header.
- `v5.0.0` (Apr 29, 2025)
  - Types are now exported so you can use them in your application.
  - `ValidationError` is now thrown when parameters are not added correctly.
  - `Error` is now returned if the API key is missing.
  - Added tests.
- `v4.1.0` (Feb 27, 2025) - Support for new [List transactional emails](#listtransactionalemails) endpoint.
- `v4.0.0` (Jan 16, 2025)
  - Added `APIError` to more easily understand API errors. [See usage example](#usage).
  - Added support for two new contact property endpoints: [List contact properties](#listcontactproperties) and [Create contact property](#createcontactproperty).
  - Deprecated and removed the `getCustomFields()` method (you can now use [`listContactProperties()`](#listcontactproperties) instead).
- `v3.4.1` (Dec 18, 2024) - Support for a new `description` attribute in [`listMailingLists()`](#listmailinglists).
- `v3.4.0` (Oct 29, 2024) - Added rate limit handling with [`RateLimitExceededError`](#handling-rate-limits).
- `v3.3.0` (Sep 9, 2024) - Added [`testApiKey()`](#testapikey) method.
- `v3.2.0` (Aug 23, 2024) - Added support for a new `mailingLists` attribute in [`findContact()`](#findcontact).
- `v3.1.1` (Aug 16, 2024) - Support for a new `isPublic` attribute in [`listMailingLists()`](#listmailinglists).
- `v3.1.0` (Aug 12, 2024) - The SDK now accepts `null` as a value for contact properties in `createContact()`, `updateContact()` and `sendEvent()`, which allows you to reset/empty properties.
- `v3.0.0` (Jul 2, 2024) - [`sendTransactionalEmail()`](#sendtransactionalemail) now accepts an object instead of separate parameters (breaking change).
- `v2.2.0` (Jul 2, 2024) - Deprecated. Added new `addToAudience` option to [`sendTransactionalEmail()`](#sendtransactionalemail).
- `v2.1.1` (Jun 20, 2024) - Added support for mailing lists in [`createContact()`](#createcontact), [`updateContact()`](#updatecontact) and [`sendEvent()`](#sendevent).
- `v2.1.0` (Jun 19, 2024) - Added support for new [List mailing lists](#listmailinglists) endpoint.
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
