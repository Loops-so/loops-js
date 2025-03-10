interface QueryOptions {
  path: `v1/${string}`;
  method?: "GET" | "POST" | "PUT";
  payload?: Record<string, any>;
  params?: Record<string, string>;
}

interface ApiKeySuccessResponse {
  success: true;
  teamName: string;
}

interface ApiKeyErrorResponse {
  error: "Invalid API key";
}

type ApiKeyResponse = ApiKeySuccessResponse | ApiKeyErrorResponse;

interface ContactSuccessResponse {
  success: true;
  id: string;
}

interface DeleteSuccessResponse {
  success: true;
  message: "Contact deleted.";
}

interface ErrorResponse {
  success: false;
  message: string;
}

type Contact = {
  /**
   * The contact's ID.
   */
  id: string;
  /**
   * The contact's email address.
   */
  email: string;
  /**
   * The contact's first name.
   */
  firstName: string | null;
  /**
   * The contact's last name.
   */
  lastName: string | null;
  /**
   * The source the contact was created from.
   */
  source: string | null;
  /**
   * Whether the contact will receive campaign and loops emails.
   */
  subscribed: boolean;
  /**
   * The contact's user group (used to segemnt users when sending emails).
   */
  userGroup: string | null;
  /**
   * A unique user ID (for example, from an external application).
   */
  userId: string | null;
  /**
   * Mailing lists the contact is subscribed to.
   */
  mailingLists: Record<string, true>;
} & Record<string, string | number | boolean | null>;

interface ContactPropertySuccessResponse {
  success: boolean;
}

interface EventSuccessResponse {
  success: boolean;
}

type EventResponse = EventSuccessResponse | ErrorResponse;

interface TransactionalSuccess {
  success: true;
}

interface TransactionalError {
  type: "error";
  success: false;
  path: string;
  message: string;
}

interface TransactionalNestedError {
  type: "nestedError";
  success: false;
  error: {
    path: string;
    message: string;
  };
  transactionalId?: string;
}

type TransactionalResponse =
  | TransactionalSuccess
  | TransactionalError
  | TransactionalNestedError;

type ContactProperties = Record<string, string | number | boolean | null>;

type EventProperties = Record<string, string | number | boolean>;

type TransactionalVariables = Record<string, string | number>;

interface TransactionalAttachment {
  /**
   * The file name, shown in email clients.
   */
  filename: string;
  /**
   * MIME type of the file.
   */
  contentType: string;
  /**
   * Base64-encoded content of the file.
   */
  data: string;
}

interface MailingList {
  /**
   * The ID of the list.
   */
  id: string;
  /**
   * The name of the list.
   */
  name: string;
  /**
   * The list's description.
   */
  description: string | null;
  /**
   * Whether the list is public (true) or private (false).
   * @see https://loops.so/docs/contacts/mailing-lists#list-visibility
   */
  isPublic: boolean;
}

interface PaginationData {
  /**
   * Total results found.
   */
  totalResults: number;
  /**
   * The number of results returned in this response.
   */
  returnedResults: number;
  /**
   * The maximum number of results requested.
   */
  perPage: number;
  /**
   * Total number of pages.
   */
  totalPages: number;
  /**
   * The next cursor (for retrieving the next page of results using the `cursor` parameter), or `null` if there are no further pages.
   */
  nextCursor: string | null;
  /**
   * The URL of the next page of results, or `null` if there are no further pages.
   */
  nextPage: string | null;
}

interface TransactionalEmail {
  /** The ID of the transactional email. */
  id: string;
  /**
   * The name of the transactional email.
   */
  name: string;
  /**
   * The date the email was last updated in ECMA-262 date-time format.
   * @see https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
   */
  lastUpdate: string;
  /**
   * Data variables in the transactional email.
   */
  dataVariables: string[];
}

interface ListTransactionalsResponse {
  pagination: PaginationData;
  data: TransactionalEmail[];
}

class RateLimitExceededError extends Error {
  limit: number;
  remaining: number;
  constructor(limit: number, remaining: number) {
    super(`Rate limit of ${limit} requests per second exceeded.`);
    this.name = "RateLimitExceededError";
    this.limit = limit;
    this.remaining = remaining;
  }
}

class APIError extends Error {
  statusCode: number;
  json: Record<string, unknown>;
  constructor(statusCode: number, json: Record<string, unknown>) {
    super(`${statusCode}${json.message ? ` - ${json.message}` : ""}`);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.json = json;

    // This captures the proper stack trace in most environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

class LoopsClient {
  apiKey: string;
  apiRoot = "https://app.loops.so/api/";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Creates and sends a query to the Loops API.
   *
   * @param {Object} params
   * @param {string} params.path Endpoint path
   * @param {string} params.method HTTP method
   * @param {Object} params.payload Payload for PUT and POST requests
   * @param {Object} params.params URL query parameters
   */
  private async _makeQuery({
    path,
    method = "GET",
    payload,
    params,
  }: QueryOptions) {
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${this.apiKey}`);
    headers.set("Content-Type", "application/json");

    const url = new URL(path, this.apiRoot);
    if (params && method === "GET") {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value)
      );
    }

    try {
      const response = await fetch(url.href, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (response.status === 429) {
        // Handle rate limiting
        const limit = parseInt(
          response.headers.get("x-ratelimit-limit") || "10",
          10
        );
        const remaining = parseInt(
          response.headers.get("x-ratelimit-remaining") || "10",
          10
        );
        throw new RateLimitExceededError(limit, remaining);
      }

      // All other status codes from API, throw an error
      if (!response.ok) {
        const json = await response.json();
        throw new APIError(response.status, json);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Test an API key.
   *
   * @see https://loops.so/docs/api-reference/api-key
   *
   * @returns {Object} Success or error message (JSON)
   */
  async testApiKey(): Promise<ApiKeyResponse> {
    return this._makeQuery({
      path: "v1/api-key",
    });
  }

  /**
   * Create a new contact.
   *
   * @param {string} email The email address of the contact.
   * @param {Object} [properties] All other contact properties, including custom properties.
   * @param {Object} [mailingLists] An object of mailing list IDs and boolean subscription statuses.
   *
   * @see https://loops.so/docs/api-reference/create-contact
   *
   * @returns {Object} Contact record or error response (JSON)
   */
  async createContact(
    email: string,
    properties?: ContactProperties,
    mailingLists?: Record<string, boolean>
  ): Promise<ContactSuccessResponse | ErrorResponse> {
    const payload = { email, ...properties, mailingLists };
    return this._makeQuery({
      path: "v1/contacts/create",
      method: "POST",
      payload,
    });
  }

  /**
   * Update a contact.
   *
   * @param {string} email The email address of the contact.
   * @param {Object} properties All other contact properties, including custom properties.
   * @param {Object} [mailingLists] An object of mailing list IDs and boolean subscription statuses.
   *
   * @see https://loops.so/docs/api-reference/update-contact
   *
   * @returns {Object} Contact record or error response (JSON)
   */
  async updateContact(
    email: string,
    properties: ContactProperties,
    mailingLists?: Record<string, boolean>
  ): Promise<ContactSuccessResponse | ErrorResponse> {
    const payload = { email, ...properties, mailingLists };
    return this._makeQuery({
      path: "v1/contacts/update",
      method: "PUT",
      payload,
    });
  }

  /**
   * Find a contact by email address or user ID.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   *
   * @see https://loops.so/docs/api-reference/find-contact
   *
   * @returns {Object} List of contact records (JSON)
   */
  async findContact({
    email,
    userId,
  }: {
    email?: string;
    userId?: string;
  }): Promise<Contact[]> {
    if (email && userId) throw "Only one parameter is permitted.";
    const params: { email?: string; userId?: string } = {};
    if (email) params["email"] = email;
    else if (userId) params["userId"] = userId;
    else throw "You must provide an `email` or `userId` value.";
    return this._makeQuery({
      path: "v1/contacts/find",
      params,
    });
  }

  /**
   * Delete a contact by email or user ID.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   *
   * @see https://loops.so/docs/api-reference/delete-contact
   *
   * @returns {Object} Confirmation or error response (JSON)
   */
  async deleteContact({
    email,
    userId,
  }: {
    email?: string;
    userId?: string;
  }): Promise<DeleteSuccessResponse | ErrorResponse> {
    if (email && userId) throw "Only one parameter is permitted.";
    const payload: { email?: string; userId?: string } = {};
    if (email) payload["email"] = email;
    else if (userId) payload["userId"] = userId;
    else throw "You must provide an `email` or `userId` value.";
    return this._makeQuery({
      path: "v1/contacts/delete",
      method: "POST",
      payload,
    });
  }

  /**
   * Create a new contact property.
   *
   * @param {string} name The name of the property. Should be in camelCase like "planName".
   * @param {"string" | "number" | "boolean" | "date"} type The property's value type.
   *
   * @see https://loops.so/docs/api-reference/create-contact-property
   *
   * @returns {Object} Contact property record or error response (JSON)
   */
  async createContactProperty(
    name: string,
    type: "string" | "number" | "boolean" | "date"
  ): Promise<ContactPropertySuccessResponse | ErrorResponse> {
    return this._makeQuery({
      path: "v1/contacts/properties",
      method: "POST",
      payload: {
        ["name"]: name,
        ["type"]: type,
      },
    });
  }

  /**
   * Get contact properties.
   *
   * @param {"all" | "custom"} [list] Return all or just custom properties.
   *
   * @see https://loops.so/docs/api-reference/list-contact-properties
   *
   * @returns {Object} List of contact properties (JSON)
   */
  async getCustomProperties(
    list?: "all" | "custom"
  ): Promise<Record<"key" | "label" | "type", string>[]> {
    return this._makeQuery({
      path: "v1/contacts/properties",
      params: { list: list || "all" },
    });
  }

  /**
   * Get mailing lists.
   *
   * @see https://loops.so/docs/api-reference/list-mailing-lists
   *
   * @returns {Object} List of mailing lists (JSON)
   */
  async getMailingLists(): Promise<MailingList[]> {
    return this._makeQuery({
      path: "v1/lists",
    });
  }

  /**
   * Send an event.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   * @param {string} params.eventName The name of the event.
   * @param {Object} [params.contactProperties] Properties to update the contact with, including custom properties.
   * @param {Object} [params.eventProperties] Event properties, made available in emails triggered by the event.
   * @param {Object} [params.mailingLists] An object of mailing list IDs and boolean subscription statuses.
   *
   * @see https://loops.so/docs/api-reference/send-event
   *
   * @returns {Object} Response (JSON)
   */
  async sendEvent({
    email,
    userId,
    eventName,
    contactProperties,
    eventProperties,
    mailingLists,
  }: {
    email?: string;
    userId?: string;
    eventName: string;
    contactProperties?: ContactProperties;
    eventProperties?: EventProperties;
    mailingLists?: Record<string, boolean>;
  }): Promise<EventResponse> {
    if (!userId && !email)
      throw "You must provide an `email` or `userId` value.";
    const payload: {
      email?: string;
      userId?: string;
      eventName: string;
      eventProperties?: EventProperties;
      mailingLists?: Record<string, boolean>;
    } = {
      eventName,
      ...contactProperties,
      eventProperties,
      mailingLists,
    };
    if (email) payload["email"] = email;
    if (userId) payload["userId"] = userId;
    return this._makeQuery({
      path: "v1/events/send",
      method: "POST",
      payload,
    });
  }

  /**
   * Send a transactional email.
   *
   * @param {Object} params
   * @param {string} params.transactionalId The ID of the transactional email to send.
   * @param {string} params.email The email address of the recipient.
   * @param {boolean} [params.addToAudience] Create a contact in your audience using the provided email address (if one doesn't already exist).
   * @param {Object} [params.dataVariables] Data variables as defined by the transational email template.
   * @param {Object[]} [params.attachments] File(s) to be sent along with the email message.
   *
   * @see https://loops.so/docs/api-reference/send-transactional-email
   *
   * @returns {Object} Confirmation or error response (JSON)
   */
  async sendTransactionalEmail({
    transactionalId,
    email,
    addToAudience,
    dataVariables,
    attachments,
  }: {
    transactionalId: string;
    email: string;
    addToAudience?: boolean;
    dataVariables?: TransactionalVariables;
    attachments?: Array<TransactionalAttachment>;
  }): Promise<TransactionalResponse> {
    const payload = {
      transactionalId,
      email,
      addToAudience,
      dataVariables,
      attachments,
    };
    return this._makeQuery({
      path: "v1/transactional",
      method: "POST",
      payload,
    });
  }

  /**
   * List published transactional emails.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response.
   *
   * @see https://loops.so/docs/api-reference/list-transactional-emails
   *
   * @returns {Object} List of transactional emails (JSON)
   */
  async getTransactionalEmails({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListTransactionalsResponse> {
    let params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/transactional",
      params,
    });
  }
}

export { LoopsClient, RateLimitExceededError, APIError };
