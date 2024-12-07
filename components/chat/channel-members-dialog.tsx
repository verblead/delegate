import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus, Shield, ShieldAlert, UserMinus } from 'lucide-react'
import { useChannelMembers } from '@/hooks/use-channel-members'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

interface ChannelMembersDialogProps {
  isOpen: boolean
  onClose: () => void
  channelId: string
}

export function ChannelMembersDialog({
  isOpen,
  onClose,
  channelId,
}: ChannelMembersDialogProps) {
  const { members, loading, removeMember, updateMemberRole } = useChannelMembers(channelId)
  const { user } = useAuth()
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  // Check if the current user is an admin or owner
  const currentMember = members.find(m => m.user_id === user?.id)
  const isAdminOrOwner = currentMember?.role === 'admin' || currentMember?.role === 'owner'

  const handleRemoveMember = async (userId: string) => {
    await removeMember(userId)
  }

  const handleRoleChange = async (userId: string, newRole: 'member' | 'admin') => {
    await updateMemberRole(userId, newRole)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Channel Members
            {isAdminOrOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {members.length} member{members.length !== 1 ? 's' : ''} in this channel
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              No members in this channel
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between space-x-4 rounded-lg p-2 hover:bg-accent/50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={member.avatar_url || `https://avatar.vercel.sh/${member.user_id}`}
                        alt={member.username}
                      />
                      <AvatarFallback>
                        {member.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{member.username}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {member.role === 'owner' ? (
                          <>
                            <ShieldAlert className="h-3 w-3 mr-1 text-primary" />
                            Owner
                          </>
                        ) : member.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 mr-1 text-primary" />
                            Admin
                          </>
                        ) : (
                          'Member'
                        )}
                      </p>
                    </div>
                  </div>

                  {isAdminOrOwner && member.user_id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== 'owner' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(
                              member.user_id,
                              member.role === 'admin' ? 'member' : 'admin'
                            )}
                          >
                            {member.role === 'admin' ? (
                              <>Remove admin</>
                            ) : (
                              <>Make admin</>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          Remove from channel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
