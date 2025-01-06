const originalNow = Date.now;
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const clientTimestamp: number = body.timestamp;
    const timeDiff = originalNow() - clientTimestamp;

    console.log("Received time sync request", { clientTimestamp, timeDiff });
    Date.now = () => originalNow() - timeDiff;

    return {
      success: true,
      message: "Time synchronized successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to set time`,
      data: error,
    });
  }
});
