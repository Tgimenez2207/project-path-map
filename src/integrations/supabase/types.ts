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
      briefings: {
        Row: {
          created_at: string
          datos: Json
          id: string
          resumen_ejecutivo: string | null
          semana: string
          user_id: string
        }
        Insert: {
          created_at?: string
          datos: Json
          id?: string
          resumen_ejecutivo?: string | null
          semana: string
          user_id: string
        }
        Update: {
          created_at?: string
          datos?: Json
          id?: string
          resumen_ejecutivo?: string | null
          semana?: string
          user_id?: string
        }
        Relationships: []
      }
      cheques: {
        Row: {
          banco: string
          created_at: string
          cuenta_id: string | null
          endosado_a: string | null
          estado: string
          fecha_deposito: string | null
          fecha_emision: string
          fecha_endoso: string | null
          fecha_vencimiento: string
          id: string
          moneda: string
          monto: number
          motivo_rechazo: string | null
          notas: string | null
          numero: string
          obra_id: string | null
          obra_nombre: string | null
          recibi_de: string | null
          tipo: string
          titular: string
          updated_at: string
        }
        Insert: {
          banco: string
          created_at?: string
          cuenta_id?: string | null
          endosado_a?: string | null
          estado?: string
          fecha_deposito?: string | null
          fecha_emision?: string
          fecha_endoso?: string | null
          fecha_vencimiento: string
          id?: string
          moneda?: string
          monto?: number
          motivo_rechazo?: string | null
          notas?: string | null
          numero: string
          obra_id?: string | null
          obra_nombre?: string | null
          recibi_de?: string | null
          tipo?: string
          titular?: string
          updated_at?: string
        }
        Update: {
          banco?: string
          created_at?: string
          cuenta_id?: string | null
          endosado_a?: string | null
          estado?: string
          fecha_deposito?: string | null
          fecha_emision?: string
          fecha_endoso?: string | null
          fecha_vencimiento?: string
          id?: string
          moneda?: string
          monto?: number
          motivo_rechazo?: string | null
          notas?: string | null
          numero?: string
          obra_id?: string | null
          obra_nombre?: string | null
          recibi_de?: string | null
          tipo?: string
          titular?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cheques_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas_tesoreria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cheques_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          apellido: string | null
          ciudad: string | null
          created_at: string
          cuit: string | null
          direccion: string | null
          dni: string | null
          documento: string
          email: string | null
          estado_cliente: string | null
          id: string
          moneda_operado: string | null
          monto_total_operado: number | null
          nombre: string
          notas: string | null
          provincia: string | null
          rubro: string | null
          score_ia: Json | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          tipo_cliente_app: string | null
          unidades_compradas: number | null
          updated_at: string
        }
        Insert: {
          apellido?: string | null
          ciudad?: string | null
          created_at?: string
          cuit?: string | null
          direccion?: string | null
          dni?: string | null
          documento: string
          email?: string | null
          estado_cliente?: string | null
          id?: string
          moneda_operado?: string | null
          monto_total_operado?: number | null
          nombre: string
          notas?: string | null
          provincia?: string | null
          rubro?: string | null
          score_ia?: Json | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          tipo_cliente_app?: string | null
          unidades_compradas?: number | null
          updated_at?: string
        }
        Update: {
          apellido?: string | null
          ciudad?: string | null
          created_at?: string
          cuit?: string | null
          direccion?: string | null
          dni?: string | null
          documento?: string
          email?: string | null
          estado_cliente?: string | null
          id?: string
          moneda_operado?: string | null
          monto_total_operado?: number | null
          nombre?: string
          notas?: string | null
          provincia?: string | null
          rubro?: string | null
          score_ia?: Json | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          tipo_cliente_app?: string | null
          unidades_compradas?: number | null
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
      computos: {
        Row: {
          created_at: string
          id: string
          observaciones: string | null
          pisos: number
          presupuesto_id: string | null
          resultado: Json
          superficie: number
          terminaciones: string
          tipologia: string
          ubicacion: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          observaciones?: string | null
          pisos?: number
          presupuesto_id?: string | null
          resultado: Json
          superficie: number
          terminaciones?: string
          tipologia: string
          ubicacion: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          observaciones?: string | null
          pisos?: number
          presupuesto_id?: string | null
          resultado?: Json
          superficie?: number
          terminaciones?: string
          tipologia?: string
          ubicacion?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "computos_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          adjuntos: string[]
          creado_por: string
          created_at: string
          cuerpo: string
          estado: Database["public"]["Enums"]["estado_contrato"]
          fecha_creacion: string
          fecha_fin: string | null
          fecha_firma: string | null
          fecha_inicio: string
          forma_pago: string
          hitos: Json
          id: string
          moneda: Database["public"]["Enums"]["moneda"]
          monto_total: number
          notas: string
          numero: string
          obra_id: string | null
          obra_nombre: string | null
          parte_a: Json
          parte_b: Json
          plantilla_id: string | null
          tipo: Database["public"]["Enums"]["tipo_contrato"]
          titulo: string
          updated_at: string
          version: number
        }
        Insert: {
          adjuntos?: string[]
          creado_por?: string
          created_at?: string
          cuerpo?: string
          estado?: Database["public"]["Enums"]["estado_contrato"]
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_firma?: string | null
          fecha_inicio?: string
          forma_pago?: string
          hitos?: Json
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total?: number
          notas?: string
          numero: string
          obra_id?: string | null
          obra_nombre?: string | null
          parte_a?: Json
          parte_b?: Json
          plantilla_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_contrato"]
          titulo: string
          updated_at?: string
          version?: number
        }
        Update: {
          adjuntos?: string[]
          creado_por?: string
          created_at?: string
          cuerpo?: string
          estado?: Database["public"]["Enums"]["estado_contrato"]
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_firma?: string | null
          fecha_inicio?: string
          forma_pago?: string
          hitos?: Json
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total?: number
          notas?: string
          numero?: string
          obra_id?: string | null
          obra_nombre?: string | null
          parte_a?: Json
          parte_b?: Json
          plantilla_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_contrato"]
          titulo?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_plantilla_id_fkey"
            columns: ["plantilla_id"]
            isOneToOne: false
            referencedRelation: "plantillas_contrato"
            referencedColumns: ["id"]
          },
        ]
      }
      costos_fijos: {
        Row: {
          activo: boolean
          categoria: string
          created_at: string
          descripcion: string
          es_recurrente: boolean
          frecuencia: string | null
          id: string
          moneda: string
          monto: number
          notas: string | null
          proximo_vencimiento: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string
          created_at?: string
          descripcion: string
          es_recurrente?: boolean
          frecuencia?: string | null
          id?: string
          moneda?: string
          monto?: number
          notas?: string | null
          proximo_vencimiento?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string
          created_at?: string
          descripcion?: string
          es_recurrente?: boolean
          frecuencia?: string | null
          id?: string
          moneda?: string
          monto?: number
          notas?: string | null
          proximo_vencimiento?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cotizaciones_proveedores: {
        Row: {
          created_at: string
          descripcion: string
          fecha: string
          ganada: boolean
          id: string
          moneda: string
          monto: number
          obra_id: string | null
          proveedor_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string
          fecha?: string
          ganada?: boolean
          id?: string
          moneda?: string
          monto?: number
          obra_id?: string | null
          proveedor_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string
          fecha?: string
          ganada?: boolean
          id?: string
          moneda?: string
          monto?: number
          obra_id?: string | null
          proveedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_proveedores_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_proveedores_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas_tesoreria: {
        Row: {
          activa: boolean
          banco: string | null
          cbu: string | null
          color: string
          created_at: string
          id: string
          moneda: string
          nombre: string
          nro_cuenta: string | null
          saldo_inicial: number
          tipo: string
          updated_at: string
        }
        Insert: {
          activa?: boolean
          banco?: string | null
          cbu?: string | null
          color?: string
          created_at?: string
          id?: string
          moneda?: string
          nombre: string
          nro_cuenta?: string | null
          saldo_inicial?: number
          tipo?: string
          updated_at?: string
        }
        Update: {
          activa?: boolean
          banco?: string | null
          cbu?: string | null
          color?: string
          created_at?: string
          id?: string
          moneda?: string
          nombre?: string
          nro_cuenta?: string | null
          saldo_inicial?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: []
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
      documentos_obra: {
        Row: {
          archivo_nombre: string
          archivo_url: string
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          obra_id: string
          subido_por: string
          tamano: number | null
          tipo: string
          updated_at: string
        }
        Insert: {
          archivo_nombre: string
          archivo_url: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          obra_id: string
          subido_por?: string
          tamano?: number | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          archivo_nombre?: string
          archivo_url?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          obra_id?: string
          subido_por?: string
          tamano?: number | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_obra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
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
      evaluaciones_clientes: {
        Row: {
          autor: string
          cliente_id: string
          comentario: string
          comunicacion: number
          created_at: string
          cumplimiento_acuerdos: number
          fecha: string
          flexibilidad: number
          id: string
          obra_id: string | null
          obra_nombre: string | null
          puntualidad_pagos: number
          recomendaria: boolean
        }
        Insert: {
          autor?: string
          cliente_id: string
          comentario?: string
          comunicacion?: number
          created_at?: string
          cumplimiento_acuerdos?: number
          fecha?: string
          flexibilidad?: number
          id?: string
          obra_id?: string | null
          obra_nombre?: string | null
          puntualidad_pagos?: number
          recomendaria?: boolean
        }
        Update: {
          autor?: string
          cliente_id?: string
          comentario?: string
          comunicacion?: number
          created_at?: string
          cumplimiento_acuerdos?: number
          fecha?: string
          flexibilidad?: number
          id?: string
          obra_id?: string | null
          obra_nombre?: string | null
          puntualidad_pagos?: number
          recomendaria?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluaciones_clientes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluaciones_proveedores: {
        Row: {
          autor: string
          calidad: number
          comentario: string
          comunicacion: number
          created_at: string
          fecha: string
          id: string
          obra_id: string | null
          obra_nombre: string | null
          precio: number
          proveedor_id: string
          puntualidad: number
        }
        Insert: {
          autor?: string
          calidad?: number
          comentario?: string
          comunicacion?: number
          created_at?: string
          fecha?: string
          id?: string
          obra_id?: string | null
          obra_nombre?: string | null
          precio?: number
          proveedor_id: string
          puntualidad?: number
        }
        Update: {
          autor?: string
          calidad?: number
          comentario?: string
          comunicacion?: number
          created_at?: string
          fecha?: string
          id?: string
          obra_id?: string | null
          obra_nombre?: string | null
          precio?: number
          proveedor_id?: string
          puntualidad?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_proveedores_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluaciones_proveedores_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          color: string
          created_at: string
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          obra_id: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          obra_id?: string | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          obra_id?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_obra_id_fkey"
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
      interacciones_clientes: {
        Row: {
          autor: string
          cliente_id: string
          created_at: string
          descripcion: string
          fecha: string
          id: string
          obra_id: string | null
          obra_nombre: string | null
          resolucion: string | null
          tipo: string
          tono: string
        }
        Insert: {
          autor?: string
          cliente_id: string
          created_at?: string
          descripcion?: string
          fecha?: string
          id?: string
          obra_id?: string | null
          obra_nombre?: string | null
          resolucion?: string | null
          tipo?: string
          tono?: string
        }
        Update: {
          autor?: string
          cliente_id?: string
          created_at?: string
          descripcion?: string
          fecha?: string
          id?: string
          obra_id?: string | null
          obra_nombre?: string | null
          resolucion?: string | null
          tipo?: string
          tono?: string
        }
        Relationships: [
          {
            foreignKeyName: "interacciones_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interacciones_clientes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
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
      movimientos_tesoreria: {
        Row: {
          categoria: string
          cheque_id: string | null
          cliente_id: string | null
          comprobante: string | null
          conciliado: boolean
          contrato_id: string | null
          creado_por: string
          created_at: string
          cuenta_destino_id: string | null
          cuenta_id: string | null
          descripcion: string
          fecha: string
          id: string
          moneda: string
          monto: number
          notas: string | null
          obra_id: string | null
          obra_nombre: string | null
          proveedor_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          cheque_id?: string | null
          cliente_id?: string | null
          comprobante?: string | null
          conciliado?: boolean
          contrato_id?: string | null
          creado_por?: string
          created_at?: string
          cuenta_destino_id?: string | null
          cuenta_id?: string | null
          descripcion: string
          fecha?: string
          id?: string
          moneda?: string
          monto?: number
          notas?: string | null
          obra_id?: string | null
          obra_nombre?: string | null
          proveedor_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          cheque_id?: string | null
          cliente_id?: string | null
          comprobante?: string | null
          conciliado?: boolean
          contrato_id?: string | null
          creado_por?: string
          created_at?: string
          cuenta_destino_id?: string | null
          cuenta_id?: string | null
          descripcion?: string
          fecha?: string
          id?: string
          moneda?: string
          monto?: number
          notas?: string | null
          obra_id?: string | null
          obra_nombre?: string | null
          proveedor_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_tesoreria_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_tesoreria_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_tesoreria_cuenta_destino_id_fkey"
            columns: ["cuenta_destino_id"]
            isOneToOne: false
            referencedRelation: "cuentas_tesoreria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_tesoreria_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas_tesoreria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_tesoreria_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_tesoreria_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      nodos_gantt: {
        Row: {
          avance: number
          created_at: string
          critica: boolean | null
          dependencias: string[] | null
          duracion: number
          estado: string
          id: string
          inicio: number
          nombre: string
          obra_id: string
          orden: number
          parent_id: string | null
          responsable: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          avance?: number
          created_at?: string
          critica?: boolean | null
          dependencias?: string[] | null
          duracion?: number
          estado?: string
          id?: string
          inicio?: number
          nombre: string
          obra_id: string
          orden?: number
          parent_id?: string | null
          responsable?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          avance?: number
          created_at?: string
          critica?: boolean | null
          dependencias?: string[] | null
          duracion?: number
          estado?: string
          id?: string
          inicio?: number
          nombre?: string
          obra_id?: string
          orden?: number
          parent_id?: string | null
          responsable?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nodos_gantt_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodos_gantt_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nodos_gantt"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          color: string
          contenido: string | null
          created_at: string
          fijada: boolean
          id: string
          prioridad: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          contenido?: string | null
          created_at?: string
          fijada?: boolean
          id?: string
          prioridad?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          contenido?: string | null
          created_at?: string
          fijada?: boolean
          id?: string
          prioridad?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          created_at: string
          id: string
          leida: boolean
          mensaje: string
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leida?: boolean
          mensaje: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leida?: boolean
          mensaje?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
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
      pagos_clientes: {
        Row: {
          cliente_id: string
          concepto: string
          created_at: string
          dias_demora: number
          fecha: string
          id: string
          moneda: string
          monto: number
          obra_id: string | null
          obra_nombre: string | null
          pagado_en_fecha: boolean
        }
        Insert: {
          cliente_id: string
          concepto?: string
          created_at?: string
          dias_demora?: number
          fecha?: string
          id?: string
          moneda?: string
          monto?: number
          obra_id?: string | null
          obra_nombre?: string | null
          pagado_en_fecha?: boolean
        }
        Update: {
          cliente_id?: string
          concepto?: string
          created_at?: string
          dias_demora?: number
          fecha?: string
          id?: string
          moneda?: string
          monto?: number
          obra_id?: string | null
          obra_nombre?: string | null
          pagado_en_fecha?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pagos_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_clientes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
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
      plantillas_contrato: {
        Row: {
          created_at: string
          cuerpo: string
          descripcion: string
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_contrato"]
          variables: string[]
        }
        Insert: {
          created_at?: string
          cuerpo?: string
          descripcion?: string
          id?: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_contrato"]
          variables?: string[]
        }
        Update: {
          created_at?: string
          cuerpo?: string
          descripcion?: string
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_contrato"]
          variables?: string[]
        }
        Relationships: []
      }
      presupuesto_rubros: {
        Row: {
          costo_estimado: number
          costo_max: number | null
          costo_min: number | null
          created_at: string
          id: string
          incidencia: number
          nombre: string
          observaciones: string | null
          presupuesto_id: string
          unidad: string
        }
        Insert: {
          costo_estimado?: number
          costo_max?: number | null
          costo_min?: number | null
          created_at?: string
          id?: string
          incidencia?: number
          nombre: string
          observaciones?: string | null
          presupuesto_id: string
          unidad?: string
        }
        Update: {
          costo_estimado?: number
          costo_max?: number | null
          costo_min?: number | null
          created_at?: string
          id?: string
          incidencia?: number
          nombre?: string
          observaciones?: string | null
          presupuesto_id?: string
          unidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "presupuesto_rubros_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuestos: {
        Row: {
          created_at: string
          datos_computo: Json | null
          descripcion: string
          estado: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_creacion: string
          fecha_validez: string | null
          id: string
          moneda: Database["public"]["Enums"]["moneda"]
          monto_total: number
          numero: string
          obra_id: string | null
          origen: string
          proveedor_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          datos_computo?: Json | null
          descripcion: string
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_creacion?: string
          fecha_validez?: string | null
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total: number
          numero: string
          obra_id?: string | null
          origen?: string
          proveedor_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          datos_computo?: Json | null
          descripcion?: string
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_creacion?: string
          fecha_validez?: string | null
          id?: string
          moneda?: Database["public"]["Enums"]["moneda"]
          monto_total?: number
          numero?: string
          obra_id?: string | null
          origen?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nombre: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          activo: boolean
          ciudad: string | null
          contacto: string | null
          created_at: string
          cuit: string
          direccion: string | null
          email: string | null
          enriquecido_ia: boolean | null
          id: string
          provincia: string | null
          razon_social: string
          resumen_ia: string | null
          rubro: string
          subrubro: string | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_proveedor"]
          updated_at: string
          web: string | null
        }
        Insert: {
          activo?: boolean
          ciudad?: string | null
          contacto?: string | null
          created_at?: string
          cuit: string
          direccion?: string | null
          email?: string | null
          enriquecido_ia?: boolean | null
          id?: string
          provincia?: string | null
          razon_social: string
          resumen_ia?: string | null
          rubro: string
          subrubro?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_proveedor"]
          updated_at?: string
          web?: string | null
        }
        Update: {
          activo?: boolean
          ciudad?: string | null
          contacto?: string | null
          created_at?: string
          cuit?: string
          direccion?: string | null
          email?: string | null
          enriquecido_ia?: boolean | null
          id?: string
          provincia?: string | null
          razon_social?: string
          resumen_ia?: string | null
          rubro?: string
          subrubro?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_proveedor"]
          updated_at?: string
          web?: string | null
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
      tareas_personales: {
        Row: {
          area: string
          created_at: string
          descripcion: string | null
          estado: string
          fecha_completada: string | null
          fecha_vencimiento: string | null
          frecuencia_recurrencia: string | null
          id: string
          notas: string | null
          obra_id: string | null
          obra_nombre: string | null
          prioridad: string
          recurrente: boolean | null
          subtareas: Json | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_completada?: string | null
          fecha_vencimiento?: string | null
          frecuencia_recurrencia?: string | null
          id?: string
          notas?: string | null
          obra_id?: string | null
          obra_nombre?: string | null
          prioridad?: string
          recurrente?: boolean | null
          subtareas?: Json | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_completada?: string | null
          fecha_vencimiento?: string | null
          frecuencia_recurrencia?: string | null
          id?: string
          notas?: string | null
          obra_id?: string | null
          obra_nombre?: string | null
          prioridad?: string
          recurrente?: boolean | null
          subtareas?: Json | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_personales_obra_id_fkey"
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operaciones" | "finanzas" | "ventas" | "cliente"
      estado_contrato:
        | "borrador"
        | "revision"
        | "pendiente_firma"
        | "firmado"
        | "en_ejecucion"
        | "finalizado"
        | "rescindido"
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
      tipo_contrato:
        | "compraventa"
        | "locacion_obra"
        | "subcontrato"
        | "provision"
        | "honorarios"
        | "alquiler"
        | "otro"
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
      app_role: ["admin", "operaciones", "finanzas", "ventas", "cliente"],
      estado_contrato: [
        "borrador",
        "revision",
        "pendiente_firma",
        "firmado",
        "en_ejecucion",
        "finalizado",
        "rescindido",
      ],
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
      tipo_contrato: [
        "compraventa",
        "locacion_obra",
        "subcontrato",
        "provision",
        "honorarios",
        "alquiler",
        "otro",
      ],
      tipo_movimiento: ["ingreso", "egreso", "transferencia"],
      tipo_proveedor: ["proveedor", "contratista"],
      tipo_unidad: ["departamento", "local", "oficina", "casa"],
      tipo_vehiculo: ["camioneta", "camion", "auto", "utilitario"],
    },
  },
} as const
