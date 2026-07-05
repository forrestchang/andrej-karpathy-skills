import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const FarmContext = createContext(null)

export function FarmProvider({ children }) {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [activeFarm, setActiveFarm] = useState(null)
  const [fields, setFields] = useState([])
  const [crops, setCrops] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFarms = useCallback(async () => {
    if (!user) { setFarms([]); setActiveFarm(null); setLoading(false); return }
    const { data } = await supabase
      .from('farm_members')
      .select('farms(*), role')
      .eq('user_id', user.id)
    const farmList = (data || []).map(r => ({ ...r.farms, myRole: r.role }))
    setFarms(farmList)
    setActiveFarm(prev => {
      const match = farmList.find(f => f.id === prev?.id)
      return match || farmList[0] || null
    })
    setLoading(false)
  }, [user])

  const loadFarmData = useCallback(async () => {
    if (!activeFarm) { setFields([]); setCrops([]); setMembers([]); return }
    const [fieldsRes, cropsRes, membersRes] = await Promise.all([
      supabase.from('fields').select('*').eq('farm_id', activeFarm.id).order('name'),
      supabase.from('crops').select('*, fields(name)').eq('farm_id', activeFarm.id).order('start_date', { ascending: false }),
      supabase.from('farm_members').select('*, profile:user_id(email)').eq('farm_id', activeFarm.id),
    ])
    setFields(fieldsRes.data || [])
    setCrops(cropsRes.data || [])
    setMembers(membersRes.data || [])
  }, [activeFarm])

  useEffect(() => { loadFarms() }, [loadFarms])
  useEffect(() => { loadFarmData() }, [loadFarmData])

  const createFarm = async (name, address) => {
    const { data, error } = await supabase.from('farms').insert({ name, address, owner_id: user.id }).select().single()
    if (error) throw error
    await supabase.from('farm_members').insert({ farm_id: data.id, user_id: user.id, role: 'owner' })
    await loadFarms()
    return data
  }

  const joinFarm = async (inviteCode) => {
    const { data, error } = await supabase.rpc('join_farm_by_invite_code', { p_invite_code: inviteCode })
    if (error) throw error
    if (data.error) throw new Error(data.error)
    await loadFarms()
    return data
  }

  const createField = async (fieldData) => {
    const { data, error } = await supabase.from('fields').insert({ ...fieldData, farm_id: activeFarm.id }).select().single()
    if (error) throw error
    setFields(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateField = async (id, fieldData) => {
    const { data, error } = await supabase.from('fields').update(fieldData).eq('id', id).select().single()
    if (error) throw error
    setFields(prev => prev.map(f => f.id === id ? data : f))
    return data
  }

  const deleteField = async (id) => {
    const { error } = await supabase.from('fields').delete().eq('id', id)
    if (error) throw error
    setFields(prev => prev.filter(f => f.id !== id))
  }

  const createCrop = async (cropData) => {
    const { data, error } = await supabase.from('crops').insert({ ...cropData, farm_id: activeFarm.id }).select('*, fields(name)').single()
    if (error) throw error
    setCrops(prev => [data, ...prev])
    return data
  }

  const updateCrop = async (id, cropData) => {
    const { data, error } = await supabase.from('crops').update(cropData).eq('id', id).select('*, fields(name)').single()
    if (error) throw error
    setCrops(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const regenerateInviteCode = async () => {
    const { data, error } = await supabase.rpc('regenerate_invite_code', { p_farm_id: activeFarm.id })
    if (error) throw error
    setActiveFarm(prev => ({ ...prev, invite_code: data }))
    return data
  }

  return (
    <FarmContext.Provider value={{
      farms, activeFarm, setActiveFarm, fields, crops, members, loading,
      createFarm, joinFarm, createField, updateField, deleteField,
      createCrop, updateCrop, regenerateInviteCode, reload: loadFarmData,
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export const useFarm = () => useContext(FarmContext)
