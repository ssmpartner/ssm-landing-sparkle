revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

revoke execute on function public.claim_admin() from anon, public;
grant execute on function public.claim_admin() to authenticated;