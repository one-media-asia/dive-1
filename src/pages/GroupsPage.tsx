import React, { useState, useEffect } from 'react';
import useGroups from '@/hooks/useGroups';
import { apiClient } from '@/integrations/api/client';

export default function GroupsPage() {
  const { groups, loading, error, refresh, createGroup, addMember, removeMember } = useGroups();
  const [divers, setDivers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [groupType, setGroupType] = useState<'fundive' | 'course'>('fundive');
  const [leader, setLeader] = useState<string | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [days, setDays] = useState<string>('');
  const [selectedForGroup, setSelectedForGroup] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const [d, c] = await Promise.all([
          apiClient.divers.list(),
          apiClient.courses.list(),
        ]);
        setDivers(d);
        setCourses(c);
      } catch (err) {
        console.error('Failed to load data', err);
      }
    })();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    await createGroup({
      name,
      type: groupType,
      leader_id: leader ?? null,
      course_id: groupType === 'course' ? selectedCourse : null,
      days: groupType === 'course' ? (days ? parseInt(days) : null) : null,
    });
    setName('');
    setGroupType('fundive');
    setLeader(undefined);
    setSelectedCourse('');
    setDays('');
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Groups</h1>
        <p className="page-description">Create and manage diver groups (fundive or course) with leader assignment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 p-4 border rounded">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Group name</label>
              <input
                className="w-full mt-1 px-3 py-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Monday Beginners"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Group type</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded"
                value={groupType}
                onChange={(e) => setGroupType(e.target.value as 'fundive' | 'course')}
              >
                <option value="fundive">Fun Dive Group</option>
                <option value="course">Course Group</option>
              </select>
            </div>

            {groupType === 'course' && (
              <>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select course…</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (${c.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Duration (days)</label>
                  <input
                    className="w-full mt-1 px-3 py-2 border rounded"
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="e.g., 3"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium">Leader (optional)</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded"
                value={leader ?? ''}
                onChange={(e) => setLeader(e.target.value || undefined)}
              >
                <option value="">— none —</option>
                {divers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn w-full">
              Create Group
            </button>
          </form>
        </div>

        <div className="col-span-2 p-4 border rounded">
          <h3 className="font-semibold mb-3">Existing Groups</h3>
          {loading && <div>Loading…</div>}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <div>Failed to load groups: {error.message || JSON.stringify(error)}</div>
              <div className="mt-2">
                <button className="btn btn-sm" onClick={() => refresh()}>
                  Reload
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {groups.map((g: any) => (
              <div key={g.id} className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{g.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Type: {g.type === 'course' ? 'Course Group' : 'Fun Dive Group'}
                      {g.type === 'course' && g.course && ` • ${g.course.name}`}
                      {g.type === 'course' && g.days && ` • ${g.days} days`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Leader: {g.leader?.name || '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="text-sm font-medium">Members</label>
                  <div className="mt-2 space-y-2">
                    {(g.members ?? []).length === 0 && (
                      <div className="text-sm text-muted-foreground">No members</div>
                    )}
                    {(g.members ?? []).map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div>{m.diver?.name || 'Unknown'}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">{m.role || ''}</div>
                          <button
                            className="btn btn-sm"
                            onClick={async () => {
                              if (
                                !confirm(`Remove ${m.diver?.name || 'this member'} from ${g.name}?`)
                              )
                                return;
                              await removeMember(m.id, g.id);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-sm font-medium">Add member</label>
                  <div className="flex gap-2 mt-2">
                    <select
                      className="flex-1 px-3 py-2 border rounded"
                      value={selectedForGroup[g.id] ?? ''}
                      onChange={(e) =>
                        setSelectedForGroup((s) => ({ ...s, [g.id]: e.target.value }))
                      }
                    >
                      <option value="">Select diver…</option>
                      {divers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const diverId = selectedForGroup[g.id];
                        if (!diverId) return;
                        await addMember(g.id, diverId);
                        setSelectedForGroup((s) => ({ ...s, [g.id]: '' }));
                      }}
                      className="btn"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
