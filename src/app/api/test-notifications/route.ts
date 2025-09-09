import { type NextRequest, NextResponse } from "next/server";

import { notificationService } from "@/lib/notification-service";

// POST /api/test-notifications - Crear notificación de prueba
export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line no-console
    console.log("🚀 Iniciando petición POST /api/test-notifications");

    const body = (await request.json()) as {
      workerId: string;
      title?: string;
      body?: string;
      type?: string;
    };

    // eslint-disable-next-line no-console
    console.log("📋 Body recibido:", body);

    const {
      workerId,
      title = "🧪 Notificación de Prueba",
      body: notificationBody = "Esta es una notificación de prueba",
      type = "system_message",
    } = body;

    if (!workerId) {
      // eslint-disable-next-line no-console
      console.log("❌ workerId no proporcionado");
      return NextResponse.json(
        { error: "workerId es requerido" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line no-console
    console.log(`🧪 Creando notificación de prueba para worker ${workerId}`);
    // eslint-disable-next-line no-console
    console.log("📝 Datos de notificación:", {
      title,
      body: notificationBody,
      type,
    });

    // Verificar que el servicio esté disponible
    if (!notificationService) {
      // eslint-disable-next-line no-console
      console.error("❌ notificationService no está disponible");
      return NextResponse.json(
        { error: "Servicio de notificaciones no disponible" },
        { status: 500 },
      );
    }

    // eslint-disable-next-line no-console
    console.log("🔧 Llamando a notificationService.createAndSendNotification");

    const notification = await notificationService.createAndSendNotification(
      workerId,
      {
        title,
        body: notificationBody,
        type,
        priority: "normal",
        data: {
          testNotification: true,
          timestamp: new Date().toISOString(),
        },
      },
    );

    // eslint-disable-next-line no-console
    console.log("📋 Resultado de notificationService:", notification);

    if (notification) {
      // eslint-disable-next-line no-console
      console.log(
        "✅ Notificación de prueba creada exitosamente:",
        notification,
      );
      return NextResponse.json(
        {
          success: true,
          notification,
          message: "Notificación de prueba enviada exitosamente",
        },
        { status: 201 },
      );
    }

    // eslint-disable-next-line no-console
    console.error("❌ notificationService retornó null/falso");
    return NextResponse.json(
      { error: "Error creando notificación de prueba - servicio retornó null" },
      { status: 500 },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error en test-notifications:", error);
    // eslint-disable-next-line no-console
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return NextResponse.json(
      {
        error: `Error interno del servidor: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
