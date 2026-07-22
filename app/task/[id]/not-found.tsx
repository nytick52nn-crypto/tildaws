export default function TaskNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-neutral-500">
        Такой задачи не существует — возможно, она была удалена.
      </p>
    </main>
  );
}
