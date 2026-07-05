import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useFarm } from '../contexts/FarmContext'

export function useRecords() {
  const { user } = useAuth()
  const { activeFarm } = useFarm()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  // Store activeFarm in a ref so fetchRecords stays stable across renders
  const farmRef = useRef(activeFarm)
  farmRef.current = activeFarm

  const fetchRecords = useCallback(async (filters = {}) => {
    if (!farmRef.current) return
    setLoading(true)
    let query = supabase
      .from('activity_records')
      .select(`
        *,
        fields(name),
        crops(name, variety),
        recorder:recorded_by(email)
      `)
      .eq('farm_id', farmRef.current.id)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.id) query = query.eq('id', filters.id)
    if (filters.field_id) query = query.eq('field_id', filters.field_id)
    if (filters.crop_id) query = query.eq('crop_id', filters.crop_id)
    if (filters.activity_type) query = query.eq('activity_type', filters.activity_type)
    if (filters.date_from) query = query.gte('record_date', filters.date_from)
    if (filters.date_to) query = query.lte('record_date', filters.date_to)
    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (!error) setRecords(data || [])
    setLoading(false)
    return data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createRecord = async (recordData) => {
    const { data, error } = await supabase
      .from('activity_records')
      .insert({ ...recordData, farm_id: activeFarm.id, recorded_by: user.id })
      .select(`*, fields(name), crops(name, variety), recorder:recorded_by(email)`)
      .single()
    if (error) throw error
    setRecords(prev => [data, ...prev])
    return data
  }

  const updateRecord = async (id, recordData) => {
    const { data, error } = await supabase
      .from('activity_records')
      .update(recordData)
      .eq('id', id)
      .select(`*, fields(name), crops(name, variety), recorder:recorded_by(email)`)
      .single()
    if (error) throw error
    setRecords(prev => prev.map(r => r.id === id ? data : r))
    return data
  }

  const deleteRecord = async (id) => {
    const { error } = await supabase.from('activity_records').delete().eq('id', id)
    if (error) throw error
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  return { records, loading, fetchRecords, createRecord, updateRecord, deleteRecord }
}
