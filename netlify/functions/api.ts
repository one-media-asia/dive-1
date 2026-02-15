import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

const handler: Handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/api', '') || '/';
  const method = event.httpMethod;
  let body: any = null;
  
  try {
    if (event.body) {
      body = JSON.parse(event.body);
    }
  } catch (e) {
    // Invalid JSON body
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
  };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // Health check
    if (path === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true }),
      };
    }

    // ========= DIVERS ==========
    if (path === '/api/divers' && method === 'GET') {
      const { data, error } = await supabase
        .from('divers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (path.match(/^\/api\/divers\/[^\/]+$/) && method === 'GET') {
      const id = path.split('/').pop();
      const { data, error } = await supabase
        .from('divers')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return { statusCode: data ? 200 : 404, headers, body: JSON.stringify(data || { error: 'Not found' }) };
    }

    if (path === '/api/divers' && method === 'POST') {
      const { name, email, phone, certification_level, medical_cleared } = body;
      if (!name || !email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'name and email are required' }),
        };
      }
      const { data, error } = await supabase
        .from('divers')
        .insert([{ id: uuidv4(), name, email, phone: phone || null, certification_level: certification_level || null, medical_cleared: medical_cleared ? true : false }])
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/api\/divers\/[^\/]+$/) && method === 'PUT') {
      const id = path.split('/').pop();
      const { name, email, phone, certification_level, medical_cleared } = body;
      const { data, error } = await supabase
        .from('divers')
        .update({ name, email, phone: phone || null, certification_level: certification_level || null, medical_cleared: medical_cleared ? true : false })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ========= BOOKINGS ==========
    if (path === '/api/bookings' && method === 'GET') {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (path === '/api/bookings' && method === 'POST') {
      const { diver_id, course_id, group_id, accommodation_id, check_in, check_out, total_amount, notes } = body;
      if (!diver_id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'diver_id is required' }) };
      }
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          id: uuidv4(),
          diver_id,
          course_id: course_id || null,
          group_id: group_id || null,
          accommodation_id: accommodation_id || null,
          check_in: check_in || null,
          check_out: check_out || null,
          total_amount: total_amount || 0,
          invoice_number: `INV-${Date.now().toString(36).toUpperCase()}`,
          payment_status: 'unpaid',
          notes: notes || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/api\/bookings\/[^\/]+$/) && method === 'PUT') {
      const id = path.split('/').pop();
      const { diver_id, course_id, group_id, accommodation_id, check_in, check_out, total_amount, payment_status, notes } = body;
      const { data, error } = await supabase
        .from('bookings')
        .update({
          diver_id,
          course_id: course_id || null,
          group_id: group_id || null,
          accommodation_id: accommodation_id || null,
          check_in: check_in || null,
          check_out: check_out || null,
          total_amount: total_amount || 0,
          payment_status: payment_status || 'unpaid',
          notes: notes || null,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ========= COURSES ==========
    if (path === '/api/courses' && method === 'GET') {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (path === '/api/courses' && method === 'POST') {
      const { name, price, duration_days, description, instructor_id, boat_id, start_date, end_date, max_students } = body;
      if (!name) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'name is required' }) };
      }
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          id: uuidv4(),
          name,
          price: price || 0,
          duration_days: duration_days || null,
          description: description || null,
          instructor_id: instructor_id || null,
          boat_id: boat_id || null,
          start_date: start_date || null,
          end_date: end_date || null,
          max_students: max_students || 6,
        }])
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify(data) };
    }

    // ========= GROUPS ==========
    if (path === '/api/groups' && method === 'GET') {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    // ========= ACCOMMODATIONS ==========
    if (path === '/api/accommodations' && method === 'GET') {
      const { data, error } = await supabase
        .from('accommodations')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    // ========= EQUIPMENT ==========
    if (path === '/api/equipment' && method === 'GET') {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    // Not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

export { handler };

