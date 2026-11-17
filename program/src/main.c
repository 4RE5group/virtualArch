#include "virtualArch.h"

int	read_file(const char *path, char **buffer, size_t *file_size)
{
	FILE *file = fopen(path, "rb");
	if (!file)
		return -1;

	if (fseek(file, 0, SEEK_END) != 0)
	{
		fclose(file);
		return -1;
	}

	long size = ftell(file);
	if (size < 0)
	{
		fclose(file);
		return -1;
	}

	rewind(file);

	char *data = malloc((size_t)size);
	if (!data && size > 0)
	{
		fclose(file);
		return -1;
	}

	size_t bytes_read = fread(data, 1, (size_t)size, file);
	if (bytes_read != (size_t)size || ferror(file))
	{
		free(data);
		fclose(file);
		return -1;
	}

	fclose(file);

	*buffer = data;
	*file_size = bytes_read;

	return 0;
}

int	main(int argc, char **argv)
{
	if (argc != 3)
		goto error;

	char *file_content;
	size_t  file_size = 0;

	if (read_file(argv[2], &file_content, &file_size) != 0)
	{
        perror("read_file");
        return 1;
    }

	if (!strcmp(argv[1], "-c"))
	{
		int result = compile(file_content, file_size);
		free(file_content);
		return result;
	}
	else if (!strcmp(argv[1], "-e"))
	{
		uint16_t *opcodes;
		size_t opcode_count;
		int result;

		result = assemble(file_content, file_size, &opcodes, &opcode_count);
		free(file_content);
		if (result != 0)
			return result;
		result = emulate(opcodes, opcode_count);
		free(opcodes);
		return result;
	}
	else
		goto error;

	return 0;

error:
	err("Usage: virtualArch -c|-e [file name]\n       -e  emulate program\n       -c  compile program\n");
}
