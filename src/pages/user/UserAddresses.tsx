import { useState } from 'react'
import { Edit3, MapPin, Plus, Star, Trash2 } from 'lucide-react'
import { UserEmpty, UserPageHeader } from './UserLayout'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Form'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../store/uiStore'
import { isPhone } from '../../lib/utils'
import type { Address } from '../../types'

const EMPTY = { name: '', phone: '', region: '', detail: '', isDefault: false }

export default function UserAddresses() {
  const addresses = useAuthStore((s) => s.addresses)
  const addAddress = useAuthStore((s) => s.addAddress)
  const updateAddress = useAuthStore((s) => s.updateAddress)
  const removeAddress = useAuthStore((s) => s.removeAddress)
  const setDefault = useAuthStore((s) => s.setDefaultAddress)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [removeTarget, setRemoveTarget] = useState<Address | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setErrors({})
    setOpen(true)
  }

  const openEdit = (a: Address) => {
    setEditing(a)
    setForm({ name: a.name, phone: a.phone, region: a.region, detail: a.detail, isDefault: a.isDefault })
    setErrors({})
    setOpen(true)
  }

  const save = () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 2) next.name = '请填写收货人姓名'
    if (!isPhone(form.phone)) next.phone = '请输入有效手机号'
    if (form.region.trim().length < 4) next.region = '请填写所在地区'
    if (form.detail.trim().length < 5) next.detail = '请填写详细地址'
    setErrors(next)
    if (Object.keys(next).length) return

    if (editing) {
      updateAddress(editing.id, { ...form })
      toast.success('地址已更新')
    } else {
      addAddress({ ...form })
      toast.success('地址已保存')
    }
    setOpen(false)
  }

  return (
    <div>
      <UserPageHeader
        title="地址管理"
        description="收货地址用于农资订单配送，可设置默认地址。"
        action={
          <Button size="sm" onClick={openCreate} iconLeft={<Plus size={13} />}>
            新增地址
          </Button>
        }
      />

      {addresses.length === 0 ? (
        <UserEmpty
          title="还没有收货地址"
          description="新增一个常用收货地址，下单时会自动带入。"
          action={
            <Button size="sm" onClick={openCreate}>
              新增地址
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <article
              key={a.id}
              className="rounded-panel border border-line bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/10 text-moss">
                    <MapPin size={13} />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-forest">
                      {a.name}
                      <span className="num ml-2 text-[11px] font-normal text-muted">{a.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')}</span>
                    </p>
                    {a.isDefault && (
                      <span className="mt-0.5 inline-block rounded bg-moss/10 px-1.5 py-0.5 text-[9px] text-moss">默认地址</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink/70">
                {a.region}
                <br />
                {a.detail}
              </p>

              <div className="mt-3 flex items-center gap-2 border-t border-line/60 pt-3">
                {!a.isDefault && (
                  <button
                    onClick={() => {
                      setDefault(a.id)
                      toast.success('已设为默认地址')
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] text-muted transition hover:text-moss"
                  >
                    <Star size={10} /> 设为默认
                  </button>
                )}
                <button
                  onClick={() => openEdit(a)}
                  className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-forest transition hover:text-moss"
                >
                  <Edit3 size={10} /> 编辑
                </button>
                <button
                  onClick={() => setRemoveTarget(a)}
                  className="inline-flex items-center gap-1 text-[10.5px] text-muted transition hover:text-[#A63E28]"
                >
                  <Trash2 size={10} /> 删除
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑地址' : '新增地址'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={save}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="收货人" required error={errors.name} htmlFor="an">
              <Input
                id="an"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={!!errors.name}
                placeholder="姓名"
              />
            </Field>
            <Field label="手机号" required error={errors.phone} htmlFor="ap">
              <Input
                id="ap"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, '').slice(0, 11) })}
                error={!!errors.phone}
                placeholder="11 位手机号"
                inputMode="tel"
              />
            </Field>
          </div>
          <Field label="所在地区" required error={errors.region} htmlFor="ar" hint="省 / 市 / 区县">
            <Input
              id="ar"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              error={!!errors.region}
              placeholder="如：山东省 潍坊市 寿光市"
            />
          </Field>
          <Field label="详细地址" required error={errors.detail} htmlFor="ad">
            <Input
              id="ad"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              error={!!errors.detail}
              placeholder="乡镇 / 村 / 门牌 / 仓库"
            />
          </Field>
          <label className="flex items-center gap-2 text-[12.5px] text-ink/75">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 accent-[#173D32]"
            />
            设为默认地址
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget) return
          removeAddress(removeTarget.id)
          toast.success('地址已删除')
        }}
        title="删除地址"
        description={removeTarget ? `${removeTarget.region} ${removeTarget.detail}` : ''}
      />
    </div>
  )
}
