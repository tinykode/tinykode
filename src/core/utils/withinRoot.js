export const withinRoot = (path) => {
    const normalizedPath = path.replace(/\\/g, '/').replace(/\/$/, '');
    const cwd = process.cwd().replace(/\\/g, '/').replace(/\/$/, '');
    return normalizedPath.startsWith(cwd);
};