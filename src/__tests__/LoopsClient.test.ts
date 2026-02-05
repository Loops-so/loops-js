import {
  APIError,
  LoopsClient,
  RateLimitExceededError,
  ValidationError,
} from "../index";

describe("LoopsClient", () => {
  const apiKey = "test-api-key";
  let client: LoopsClient;

  beforeEach(() => {
    client = new LoopsClient(apiKey);
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  describe("constructor", () => {
    it("should create a new instance with the provided API key", () => {
      expect(client).toBeInstanceOf(LoopsClient);
      expect(client.apiKey).toBe(apiKey);
    });

    it("should throw error for empty API key", () => {
      expect(() => new LoopsClient("")).toThrow("API key is required");
    });
  });

  describe("testApiKey", () => {
    it("should make a request to the API key endpoint", async () => {
      const mockResponse = { success: true, teamName: "Test Team" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.testApiKey();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/api-key"),
        expect.any(Object)
      );
    });

    it("should handle invalid API key response", async () => {
      const mockResponse = { error: "Invalid API key" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.testApiKey()).rejects.toThrow(APIError);
    });

    it("should handle rate limiting", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 429,
        headers: new Headers({
          "x-ratelimit-limit": "10",
          "x-ratelimit-remaining": "0",
        }),
      });

      await expect(client.testApiKey()).rejects.toThrow(RateLimitExceededError);
    });

    it("should handle network errors", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(client.testApiKey()).rejects.toThrow("Network error");
    });
  });

  describe("createContact", () => {
    it("should create a contact with the provided email", async () => {
      const email = "test@example.com";
      const mockResponse = { success: true, id: "123" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createContact({ email });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/create"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email }),
        })
      );
    });

    it("should create a contact with the provided email and properties", async () => {
      const email = "test@example.com";
      const properties = {
        name: "John Doe",
        age: 30,
        isActive: true,
      };
      const mockResponse = { success: true, id: "123" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createContact({ email, properties });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/create"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ ...properties, email }),
        })
      );
    });

    it("should handle error when contact already exists", async () => {
      const email = "existing@example.com";
      const mockResponse = {
        success: false,
        message: "Contact with this email already exists",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.createContact({ email })).rejects.toThrow(APIError);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/create"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email }),
        })
      );
    });

    it("should throw error for missing email", async () => {
      // @ts-expect-error - testing invalid input
      await expect(client.createContact()).rejects.toThrow(TypeError);
    });
  });

  describe("updateContact", () => {
    it("should update contact successfully", async () => {
      const email = "test@example.com";
      const properties = {
        firstName: "John",
        lastName: "Doe",
        userGroup: "customers",
      };
      const mailingLists = {
        newsletter_id: true,
      };
      const mockResponse = { success: true, id: "123" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateContact({
        email,
        properties,
        mailingLists,
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/update"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ ...properties, mailingLists, email }),
        })
      );
    });

    it("should update contact by userId", async () => {
      const userId = "user_123";
      const properties = {
        firstName: "John",
        lastName: "Doe",
        userGroup: "customers",
      };
      const mailingLists = {
        newsletter_id: true,
      };
      const mockResponse = { success: true, id: "123" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateContact({
        userId,
        properties,
        mailingLists,
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/update"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ ...properties, mailingLists, userId }),
        })
      );
    });

    it("should create contact when contact does not exist", async () => {
      const email = "nonexistent@example.com";
      const mockResponse = {
        success: true,
        id: "123",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateContact({ email });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/update"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ email }),
        })
      );
    });

    it("should throw error for missing email and userId", async () => {
      await expect(client.updateContact({})).rejects.toThrow(ValidationError);
    });
  });

  describe("createContactProperty", () => {
    it("should create contact property successfully", async () => {
      const name = "customField";
      const type = "string";
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createContactProperty(name, type);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/properties"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name, type }),
        })
      );
    });

    it("should handle error for invalid property type", async () => {
      const mockResponse = {
        success: false,
        message: "Invalid property type",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(
        client.createContactProperty("test", "invalid" as any)
      ).rejects.toThrow(APIError);
    });

    it("should throw error for missing name", async () => {
      await expect(
        client.createContactProperty(undefined as any, "string" as any)
      ).rejects.toThrow(TypeError);
    });

    it("should handle error when property name already exists", async () => {
      const name = "existingField";
      const type = "string";
      const mockResponse = {
        success: false,
        message: "Property with this name already exists",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.createContactProperty(name, type)).rejects.toThrow(
        APIError
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/properties"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name, type }),
        })
      );
    });
  });

  describe("sendEvent", () => {
    it("should send an event successfully with email", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
        contactProperties: {
          firstName: "John",
          lastName: "Doe",
        },
        eventProperties: {
          source: "web",
        },
        mailingLists: {
          newsletter_id: true,
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/events/send"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: eventData.eventName,
            ...eventData.contactProperties,
            eventProperties: eventData.eventProperties,
            mailingLists: eventData.mailingLists,
            email: eventData.email,
          }),
        })
      );
    });

    it("should send an event successfully with userId", async () => {
      const eventData = {
        userId: "user_123",
        eventName: "test_event",
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/events/send"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: eventData.eventName,
            userId: eventData.userId,
          }),
        })
      );
    });

    it("should throw error when neither email nor userId is provided", async () => {
      const eventData = {
        eventName: "test_event",
      } as any;

      await expect(client.sendEvent(eventData)).rejects.toThrow(
        ValidationError
      );
    });

    it("should handle API error response", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
      };
      const mockResponse = {
        success: false,
        error: "Invalid event name",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.sendEvent(eventData)).rejects.toThrow(APIError);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/events/send"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: eventData.eventName,
            email: eventData.email,
          }),
        })
      );
    });

    it("should send event with idempotency key", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
        headers: {
          "Idempotency-Key": "unique_key_123",
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);

      // Get the actual fetch call arguments
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestOptions = fetchCall[1];

      // Verify headers using Headers object methods
      const headers = requestOptions.headers;
      expect(headers.get("Idempotency-Key")).toBe("unique_key_123");

      // Verify the body doesn't contain idempotency key
      expect(requestOptions.body).toBe(
        JSON.stringify({
          eventName: eventData.eventName,
          email: eventData.email,
        })
      );
    });

    it("should send event without idempotency key when empty string", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
        headers: {
          "Idempotency-Key": "",
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);

      // Get the actual fetch call arguments
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestOptions = fetchCall[1];

      // Verify no header is set
      expect(requestOptions.headers.get("Idempotency-Key")).toBeNull();
    });
  });

  describe("sendTransactionalEmail", () => {
    it("should send a transactional email successfully", async () => {
      const emailData = {
        transactionalId: "email_123",
        email: "test@example.com",
        dataVariables: {
          name: "John",
          product: "Widgets",
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendTransactionalEmail(emailData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(emailData),
        })
      );
    });

    it("should handle error when sending transactional email fails", async () => {
      const emailData = {
        transactionalId: "invalid_id",
        email: "test@example.com",
      };
      const mockResponse = {
        success: false,
        message: "Transactional email template not found",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.sendTransactionalEmail(emailData)).rejects.toThrow(
        APIError
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(emailData),
        })
      );
    });

    it("should throw TypeError for missing required fields", async () => {
      const emailData = {
        email: "test@example.com",
      } as any;

      await expect(client.sendTransactionalEmail(emailData)).rejects.toThrow(
        TypeError
      );
    });
  });

  describe("non-JSON error responses", () => {
    it("should handle HTML error response", async () => {
      const htmlBody = "<html><body>502 Bad Gateway</body></html>";
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 502,
        headers: new Headers(),
        text: () => Promise.resolve(htmlBody),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(502);
        expect((error as APIError).json).toBeNull();
        expect((error as APIError).rawBody).toBe(htmlBody);
      }
    });

    it("should handle plain text error response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        headers: new Headers(),
        text: () => Promise.resolve("Service Unavailable"),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(503);
        expect((error as APIError).rawBody).toBe("Service Unavailable");
      }
    });

    it("should handle empty body error response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: () => Promise.resolve(""),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).json).toBeNull();
        expect((error as APIError).rawBody).toBe("");
      }
    });

    it("should still parse valid JSON errors normally", async () => {
      const jsonError = { success: false, message: "Invalid API key" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify(jsonError)),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).json).toEqual(jsonError);
        expect((error as APIError).rawBody).toBeUndefined();
      }
    });

    it("should throw APIError when success response is not JSON", async () => {
      const htmlBody = "<html><body>OK</body></html>";
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(htmlBody),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(200);
        expect((error as APIError).json).toBeNull();
        expect((error as APIError).rawBody).toBe(htmlBody);
      }
    });
  });

  describe("listTransactionalEmails", () => {
    it("should list transactional emails successfully", async () => {
      const mockTransactionalEmails = [
        {
          id: "trans_123",
          name: "Welcome Email",
          lastUpdated: "2023-01-02T00:00:00.000Z",
          dataVariables: ["name", "product"],
        },
      ];
      const mockResponse = {
        pagination: {
          totalResults: 1,
          returnedResults: 1,
          perPage: 1,
          totalPages: 1,
          nextCursor: null,
          nextPage: null,
        },
        data: mockTransactionalEmails,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getTransactionalEmails();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional"),
        expect.objectContaining({
          method: "GET",
        })
      );

      // Type checking
      result.data.forEach((email) => {
        expect(typeof email.id).toBe("string");
        expect(typeof email.name).toBe("string");
        expect(typeof email.lastUpdated).toBe("string");
        expect(Array.isArray(email.dataVariables)).toBe(true);
        expect(email.dataVariables.length).toBe(2);
      });
    });

    it("should handle empty response", async () => {
      const mockResponse = {
        pagination: {
          totalResults: 0,
          returnedResults: 0,
          perPage: 20,
          totalPages: 0,
        },
        data: [],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getTransactionalEmails();

      expect(result.data).toEqual([]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional"),
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });
});
