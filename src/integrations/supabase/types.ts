export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bitacora: {
        Row: {
          autor: string
          created_at: string
          descripcion: string
          fecha: string
          id: string
          imagenes: string[] | null
          obra_id: string
          titulo: string
        }
        Insert: {
          autor: string
          created_at?: string
          descripcion: string
          fecha?: string
          id?: string
          imagenes?: string[] | null
          obra_id: string
          titulo: string
        }
        Update: {
          autor?: string
          created_at?: string
          descripcion?: string
          fecha?: string
          id?: string
          imagenes?: string[] | null
          obra_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "bitacora_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          direccion: string | null
          documento: string
          email: string | null
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          documento: string
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          direccion?: string | null
          documento?: string
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          updated_at?: string
        }
        Relationships: []
      }
      complementos: {
        Row: {
          codigo: string
          created_at: string
          id: string
          moneda: Database["public"]["Enums"]["moneda"]
          precio: number
          tipo: Database["public"]["Enums"]["tipo_complemento"]
          unidad_id: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          precio: number
          tipo: Database["public"]["Enums"]["tipo_complemento"]
          unidad_id: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          precio?: number
          tipo?: Database["public"]["Enums"]["tipo_complemento"]
          unidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complementos_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      compradores: {
        Row: {
          cliente_id: string
          created_at: string
          fecha_asignacion: string
          id: string
          porcentaje: number
          unidad_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          fecha_asignacion?: string
          id?: string
          porcentaje: number
          unidad_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          fecha_asignacion?: string
          id?: string
          porcentaje?: number
          unidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compradores_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compradores_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["estado_pago"]
          fecha_pago: string | null
          fecha_vencimiento: string
          id: string
          interes_mora: number | null
          moneda: Database["public"]["Enums"]["moneda"]
          monto: number
          monto_pagado: number | null
          numero: number
          plan_pago_id: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_pago"]
          fecha_pago?: string | null
          fecha_vencimiento: string
          id?: string
          interes_mora?: number | null
          moneda?: Database["public"]["Enums"]["moneda"]
          monto: number
          monto_pagado?: number | null
          numero: number
          plan_pago_id: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_pago"]
          fecha_pago?: string | null
          fecha_vencimiento?: string
          id?: string
          interes_mora?: number | null
          moneda?: Database["public"]["Enums"]["moneda"]
          monto?: number
          monto_pagado?: number | null
          numero?: number
          plan_pago_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_plan_pago_id_fkey"
            columns: ["plan_pago_id"]
            isOneToOne: false
            referencedRelation: "planes_pago"
            referencedColumns: ["id"]
          },
        ]
      }
      depositos: {
        Row: {
          created_at: string
          id: string
          nombre: string
          responsable: string | null
          ubicacion: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          responsable?: string | null
          ubicacion: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          responsable?: string | null
          ubicacion?: string
        }
        Relationships: []
      }
      etapas: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["estado_etapa"]
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          obra_id: string
          orden: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_etapa"]
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          obra_id: string
          orden: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_etapa"]
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          obra_id?: string
          orden?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etapas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      herramientas: {
        Row: {
          asignado_a: string | null
          categoria: string
          codigo: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_herramienta"]
          fecha_compra: string | null
          id: string
          nombre: string
          ubicacion_actual: string
          updated_at: string
          valor_compra: number | null
        }
        Insert: {
          asignado_a?: string | null
          categoria: string
          codigo: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_herramienta"]
          fecha_compra?: string | null
          id?: string
          nombre: string
          ubicacion_actual: string
          updated_at?: string
          valor_compra?: number | null
        }
        Update: {
          asignado_a?: string | null
          categoria?: string
          codigo?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_herramienta"]
          fecha_compra?: string | null
          id?: string
          nombre?: string
          ubicacion_actual?: string
          updated_at?: string
          valor_compra?: number | null
        }
        Relationships: []
      }
      items_presupuesto: {
        Row: {
          cantidad: number
          created_at: string
          descripcion: string
          id: string
          precio_unitario: number
          presupuesto_id: string
          subtotal: number
          unidad: string
        }
        Insert: {
          cantidad: number
          created_at?: string
          descripcion: string
          id?: string
          precio_unitario: number
          presupuesto_id: string
          subtotal: number
          unidad: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          descripcion?: string
          id?: string
          precio_unitario?: number
          presupuesto_id?: string
          subtotal?: number
          unidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_presupuesto_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
        ]
      }
      mantenimientos: {
        Row: {
          costo: number
          created_at: string
          descripcion: string | null
          fecha: string
          id: string
          kilometraje: number
          proximo_mantenimiento: string | null
          tipo: string
          vehiculo_id: string
        }
        Insert: {
          costo: number
          created_at?: string
          descripcion?: string | null
          fecha: string
          id?: string
          kilometraje: number
          proximo_mantenimiento?: string | null
          tipo: string
          vehiculo_id: string
        }
        Update: {
          costo?: number
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          kilometraje?: number
          proximo_mantenimiento?: string | null
          tipo?: string
          vehiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mantenimientos_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_stock: {
        Row: {
          cantidad: number
          created_at: string
          deposito_destino_id: string | null
          deposito_origen_id: string | null
          fecha: string
          id: string
          motivo: string | null
          producto_id: string
          responsable: string
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
        }
        Insert: {
          cantidad: number
          created_at?: string
          deposito_destino_id?: string | null
          deposito_origen_id?: string | null
          fecha?: string
          id?: string
          motivo?: string | null
          producto_id: string
          responsable: string
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
        }
        Update: {
          cantidad?: number
          created_at?: string
          deposito_destino_id?: string | null
          deposito_origen_id?: string | null
          fecha?: string
          id?: string
          motivo?: string | null
          producto_id?: string
          responsable?: string
          tipo?: Database["public"]["Enums"]["tipo_movimiento"]
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_stock_deposito_destino_id_fkey"
            columns: ["deposito_destino_id"]
            isOneToOne: false
            referencedRelation: "depositos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_stock_deposito_origen_id_fkey"
            columns: ["deposito_origen_id"]
            isOneToOne: false
            referencedRelation: "depositos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_stock_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          ciudad: string
          created_at: string
          descripcion: string | null
          direccion: string
          estado: Database["public"]["Enums"]["estado_obra"]
          fecha_fin_estimada: string | null
          fecha_inicio: string
          id: string
          imagen: string | null
          moneda: Database["public"]["Enums"]["moneda"]
          nombre: string
          presupuesto_total: number | null
          progreso: number
          updated_at: string
        }
        Insert: {
          ciudad: string
          created_at?: string
          descripcion?: string | null
          direccion: string
          estado?: Database["public"]["Enums"]["estado_obra"]
          fecha_fin_estimada?: string | null
          fecha_inicio: string
          id?: string
          imagen?: string | null
          moneda?: Database["public"]["Enums"]["moneda"]
          nombre: string
          presupuesto_total?: number | null
          progreso?: number
          updated_at?: string
        }
        Update: {
          ciudad?: string
          created_at?: string
          descripcion?: string | null
          direccion?: string
          estado?: Database["public"]["Enums"]["estado_obra"]
          fecha_fin_estimada?: string | null
          fecha_inicio?: string
          id?: string
          imagen?: string | null
          moneda?: Database["public"]["Enums"]["moneda"]
          nombre?: string
          presupuesto_total?: number | null
          progreso?: number
          updated_at?: string
        }
        Relationships: []
      }
      planes_pago: {
        Row: {
          cantidad_cuotas: number
          created_at: string
          fecha_inicio: string
          id: string
          moneda: Database["public"]["Enums"]["moneda"]
          monto_total: number
          nombre: string
          obra_id: string | null
          tasa_interes: number
          unidad_id: string | null
          updated_at: string
        }
        Insert: {
          cantidad_cuotas: number
          created_at?: string
          fecha_inicio: string
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total: number
          nombre: string
          obra_id?: string | null
          tasa_interes?: number
          unidad_id?: string | null
          updated_at?: string
        }
        Update: {
          cantidad_cuotas?: number
          created_at?: string
          fecha_inicio?: string
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total?: number
          nombre?: string
          obra_id?: string | null
          tasa_interes?: number
          unidad_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planes_pago_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planes_pago_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuestos: {
        Row: {
          created_at: string
          descripcion: string
          estado: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_creacion: string
          fecha_validez: string | null
          id: string
          moneda: Database["public"]["Enums"]["moneda"]
          monto_total: number
          numero: string
          obra_id: string | null
          proveedor_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion: string
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_creacion?: string
          fecha_validez?: string | null
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total: number
          numero: string
          obra_id?: string | null
          proveedor_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_creacion?: string
          fecha_validez?: string | null
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total?: number
          numero?: string
          obra_id?: string | null
          proveedor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presupuestos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          id: string
          nombre: string
          stock_minimo: number
          unidad_medida: string
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string
          id?: string
          nombre: string
          stock_minimo?: number
          unidad_medida: string
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          id?: string
          nombre?: string
          stock_minimo?: number
          unidad_medida?: string
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          activo: boolean
          created_at: string
          cuit: string
          direccion: string | null
          email: string | null
          id: string
          razon_social: string
          rubro: string
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_proveedor"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          cuit: string
          direccion?: string | null
          email?: string | null
          id?: string
          razon_social: string
          rubro: string
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_proveedor"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          cuit?: string
          direccion?: string | null
          email?: string | null
          id?: string
          razon_social?: string
          rubro?: string
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_proveedor"]
          updated_at?: string
        }
        Relationships: []
      }
      stock_items: {
        Row: {
          cantidad: number
          deposito_id: string
          id: string
          producto_id: string
          ultima_actualizacion: string
        }
        Insert: {
          cantidad?: number
          deposito_id: string
          id?: string
          producto_id: string
          ultima_actualizacion?: string
        }
        Update: {
          cantidad?: number
          deposito_id?: string
          id?: string
          producto_id?: string
          ultima_actualizacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_deposito_id_fkey"
            columns: ["deposito_id"]
            isOneToOne: false
            referencedRelation: "depositos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas: {
        Row: {
          asignado_a: string | null
          created_at: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_tarea"]
          etapa_id: string
          fecha_vencimiento: string | null
          id: string
          obra_id: string
          prioridad: Database["public"]["Enums"]["prioridad_tarea"]
          titulo: string
          updated_at: string
        }
        Insert: {
          asignado_a?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_tarea"]
          etapa_id: string
          fecha_vencimiento?: string | null
          id?: string
          obra_id: string
          prioridad?: Database["public"]["Enums"]["prioridad_tarea"]
          titulo: string
          updated_at?: string
        }
        Update: {
          asignado_a?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_tarea"]
          etapa_id?: string
          fecha_vencimiento?: string | null
          id?: string
          obra_id?: string
          prioridad?: Database["public"]["Enums"]["prioridad_tarea"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          ambientes: number | null
          codigo: string
          created_at: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_unidad"]
          id: string
          moneda: Database["public"]["Enums"]["moneda"]
          obra_id: string
          piso: number | null
          precio_lista: number
          superficie: number
          tipo: Database["public"]["Enums"]["tipo_unidad"]
          torre: string | null
          updated_at: string
        }
        Insert: {
          ambientes?: number | null
          codigo: string
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_unidad"]
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          obra_id: string
          piso?: number | null
          precio_lista: number
          superficie: number
          tipo?: Database["public"]["Enums"]["tipo_unidad"]
          torre?: string | null
          updated_at?: string
        }
        Update: {
          ambientes?: number | null
          codigo?: string
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_unidad"]
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          obra_id?: string
          piso?: number | null
          precio_lista?: number
          superficie?: number
          tipo?: Database["public"]["Enums"]["tipo_unidad"]
          torre?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      vehiculos: {
        Row: {
          anio: number
          created_at: string
          estado: Database["public"]["Enums"]["estado_vehiculo"]
          id: string
          kilometraje: number
          marca: string
          modelo: string
          patente: string
          proximo_vencimiento: string | null
          tipo: Database["public"]["Enums"]["tipo_vehiculo"]
          tipo_vencimiento: string | null
          updated_at: string
        }
        Insert: {
          anio: number
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_vehiculo"]
          id?: string
          kilometraje?: number
          marca: string
          modelo: string
          patente: string
          proximo_vencimiento?: string | null
          tipo: Database["public"]["Enums"]["tipo_vehiculo"]
          tipo_vencimiento?: string | null
          updated_at?: string
        }
        Update: {
          anio?: number
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_vehiculo"]
          id?: string
          kilometraje?: number
          marca?: string
          modelo?: string
          patente?: string
          proximo_vencimiento?: string | null
          tipo?: Database["public"]["Enums"]["tipo_vehiculo"]
          tipo_vencimiento?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estado_etapa: "pendiente" | "en_curso" | "completada"
      estado_herramienta: "disponible" | "en_uso" | "mantenimiento" | "baja"
      estado_obra:
        | "planificacion"
        | "en_curso"
        | "pausada"
        | "finalizada"
        | "cancelada"
      estado_pago: "pendiente" | "aprobado" | "rechazado" | "vencido"
      estado_presupuesto:
        | "borrador"
        | "pendiente"
        | "aprobado"
        | "rechazado"
        | "finalizado"
      estado_tarea: "pendiente" | "en_curso" | "completada"
      estado_unidad: "disponible" | "reservada" | "vendida" | "bloqueada"
      estado_vehiculo: "disponible" | "en_uso" | "mantenimiento"
      moneda: "ARS" | "USD"
      prioridad_tarea: "baja" | "media" | "alta"
      tipo_cliente: "persona" | "empresa"
      tipo_complemento: "cochera" | "baulera"
      tipo_movimiento: "ingreso" | "egreso" | "transferencia"
      tipo_proveedor: "proveedor" | "contratista"
      tipo_unidad: "departamento" | "local" | "oficina" | "casa"
      tipo_vehiculo: "camioneta" | "camion" | "auto" | "utilitario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_etapa: ["pendiente", "en_curso", "completada"],
      estado_herramienta: ["disponible", "en_uso", "mantenimiento", "baja"],
      estado_obra: [
        "planificacion",
        "en_curso",
        "pausada",
        "finalizada",
        "cancelada",
      ],
      estado_pago: ["pendiente", "aprobado", "rechazado", "vencido"],
      estado_presupuesto: [
        "borrador",
        "pendiente",
        "aprobado",
        "rechazado",
        "finalizado",
      ],
      estado_tarea: ["pendiente", "en_curso", "completada"],
      estado_unidad: ["disponible", "reservada", "vendida", "bloqueada"],
      estado_vehiculo: ["disponible", "en_uso", "mantenimiento"],
      moneda: ["ARS", "USD"],
      prioridad_tarea: ["baja", "media", "alta"],
      tipo_cliente: ["persona", "empresa"],
      tipo_complemento: ["cochera", "baulera"],
      tipo_movimiento: ["ingreso", "egreso", "transferencia"],
      tipo_proveedor: ["proveedor", "contratista"],
      tipo_unidad: ["departamento", "local", "oficina", "casa"],
      tipo_vehiculo: ["camioneta", "camion", "auto", "utilitario"],
    },
  },
} as const
