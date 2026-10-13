const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-20 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
